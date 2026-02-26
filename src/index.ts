import express, { Request, Response } from 'express';
import { PrismaClient, Contact } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

interface IdentifyRequest {
    email?: string;
    phoneNumber?: string | number;
}

app.get('/', (req, res) => {
    res.send('Identity Reconciliation Engine is UP and RUNNING. Use the dashboard to interact.');
});

app.post('/identify', async (req: Request, res: Response) => {
    try {
        const { email, phoneNumber: rawPhoneNumber } = req.body as IdentifyRequest;
        const phoneNumber = rawPhoneNumber ? rawPhoneNumber.toString() : null;

        console.log(`\n[BACKEND] 📥 Incoming Request:`);
        console.log(` - Email: ${email || 'N/A'}`);
        console.log(` - Phone: ${phoneNumber || 'N/A'}`);

        if (!email && !phoneNumber) {
            return res.status(400).json({ error: "Email or phoneNumber is required" });
        }

        // 1. Find all potentially related contacts
        const existingContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { email: email || undefined },
                    { phoneNumber: phoneNumber || undefined }
                ]
            }
        });

        if (existingContacts.length === 0) {
            // Create new primary contact
            const newContact = await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: "primary"
                }
            });
            console.log(`[BACKEND] ✨ Creating NEW Primary Contact (ID: ${newContact.id})`);
            return res.json({
                contact: {
                    primaryContatctId: newContact.id,
                    emails: [newContact.email].filter(Boolean),
                    phoneNumbers: [newContact.phoneNumber].filter(Boolean),
                    secondaryContactIds: []
                }
            });
        }

        // 2. Find the set of all linked contacts
        // We need to find the "root" primary ID for all existing contacts
        const primaryIds = new Set<number>();
        for (const contact of existingContacts) {
            if (contact.linkPrecedence === "primary") {
                primaryIds.add(contact.id);
            } else if (contact.linkedId) {
                primaryIds.add(contact.linkedId);
            }
        }

        // Fetch all contacts belonging to these primary roots to find the "true" oldest primary
        const allRelatedPrimaries = await prisma.contact.findMany({
            where: {
                id: { in: Array.from(primaryIds) },
                linkPrecedence: "primary"
            },
            orderBy: { createdAt: 'asc' }
        });

        // If for some reason we didn't find the primaries (shouldn't happen with clean data)
        if (allRelatedPrimaries.length === 0) {
            // Fallback: create new primary
            const newContact = await prisma.contact.create({
                data: { email, phoneNumber, linkPrecedence: "primary" }
            });
            return res.json({
                contact: {
                    primaryContatctId: newContact.id,
                    emails: [newContact.email].filter(Boolean),
                    phoneNumbers: [newContact.phoneNumber].filter(Boolean),
                    secondaryContactIds: []
                }
            });
        }

        const truePrimary = allRelatedPrimaries[0];
        const truePrimaryId = truePrimary.id;

        // 3. Handle merging primaries if multiple primary roots were found
        if (allRelatedPrimaries.length > 1) {
            const otherPrimaryIds = allRelatedPrimaries.slice(1).map(p => p.id);

            // Update these other primaries and their secondaries to point to the true primary
            await prisma.contact.updateMany({
                where: {
                    OR: [
                        { id: { in: otherPrimaryIds } },
                        { linkedId: { in: otherPrimaryIds } }
                    ]
                },
                data: {
                    linkedId: truePrimaryId,
                    linkPrecedence: "secondary"
                }
            });
        }

        // 4. Check if we need to create a new secondary contact
        const hasEmail = email && existingContacts.some(c => c.email === email);
        const hasPhone = phoneNumber && existingContacts.some(c => c.phoneNumber === phoneNumber);

        // We only create a new secondary if the request has information NOT already present in the linked set
        // Wait, the requirement says: "If an incoming request has either of phoneNumber or email common to an existing contact but contains new information, the service will create a “secondary” Contact row."

        // Check if the SPECIFIC email/phone combo is already in any related contact
        const exactMatch = await prisma.contact.findFirst({
            where: {
                email: email || null,
                phoneNumber: phoneNumber || null
            }
        });

        if (!exactMatch && ((email && !hasEmail) || (phoneNumber && !hasPhone))) {
            await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkedId: truePrimaryId,
                    linkPrecedence: "secondary"
                }
            });
        }

        // 5. Final Consolidation for response
        const consolidatedContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { id: truePrimaryId },
                    { linkedId: truePrimaryId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        const emails = Array.from(new Set(consolidatedContacts.map(c => c.email).filter(Boolean)));
        const phoneNumbers = Array.from(new Set(consolidatedContacts.map(c => c.phoneNumber).filter(Boolean)));
        const secondaryIds = consolidatedContacts
            .filter(c => c.linkPrecedence === "secondary")
            .map(c => c.id);

        // Reorder emails and phones to put primary's info first
        const primaryEmail = truePrimary.email;
        const primaryPhone = truePrimary.phoneNumber;

        const orderedEmails = [
            primaryEmail,
            ...emails.filter(e => e !== primaryEmail)
        ].filter(Boolean) as string[];

        const orderedPhones = [
            primaryPhone,
            ...phoneNumbers.filter(p => p !== primaryPhone)
        ].filter(Boolean) as string[];

        console.log(`[BACKEND] ✅ Response Sent: ${emails.length} emails, ${phoneNumbers.length} phones linked to ID: ${truePrimaryId}`);
        return res.json({
            contact: {
                primaryContatctId: truePrimaryId,
                emails: orderedEmails,
                phoneNumbers: orderedPhones,
                secondaryContactIds: secondaryIds
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
