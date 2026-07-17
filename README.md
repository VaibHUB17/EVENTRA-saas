Working on it...

tech used - 
stripe connect 
convex 
clerk 
typescript 
nextjs



npx convex import --table events convex/sampleData.json
npx convex dev

- creating schema(tables,indexes)

Making Sure that Users Sync between Convex & Clerk
- synchronizing users in SyncUserWithConvex.tsx
- creating users file (handling users like adding new user updating existinguser)(update--> mutation
query--> data retrival)
- providing to layout

creating homepage of events
- Eventlist.tsx (unlike SyncUserWithConvex.tsx using mutation for data updating here we using query for events fetching)
- event.ts
- eventlist.tsx carrying the home page components
- eventlist --> eventcard.tsx
- updating event.ts with geeventsavailabilty 
- creating helper functions like 
getById, 
getventsavailabilty, 
getUserTicketForEvent --> ticket.ts
- WaitingList.ts (queue position if two peoples are buying one has offer tickets and second in waiting room if the first cancelled then second one will get it...)
- handler function usestorageurl in eventcard.tsx--> utils --> storage.ts

renderqueuepostion logic- the decrement or queue till ===2 then if no tickets then sold out and if not in queue than null


releaseticket logic for passing the ticket to the next person after we release it 


