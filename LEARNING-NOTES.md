# Basics of TypeScript 

# 1 - main.ts
Think of Angular App as a House
1. main.ts - The Main Door
What it is: Entry point of your whole app. Angular starts from here.
You will modify? Almost NEVER.
Simple meaning: Like main switch of house. It just says "start the app". Don't touch it.

// It just boots your app
bootstrapApplication(AppComponent, appConfig)


# 2 - app.config.ts - The Electrician Box / Settings

What it is: Global settings for your app.
You will modify? YES, 3-4 times in whole project.
When you modify:
When you need API calls -> you added provideHttpClient()
When you need routing -> provideRouter()
Later when you need Animations -> provideAnimations()

Simple meaning: One place where you tell Angular "I need these superpowers in whole house". If you don't add HttpClient here, your API calls will NEVER work.


# 3  app.routes.ts - The Road Map / Directory Board

What it is: Tells browser which URL shows which component.
You will modify? YES, VERY FREQUENTLY. Every time you create new page.
Simple meaning: Like sign board in mall.

{ path: '', component: RoomList }      // localhost:4200 -> show rooms
{ path: 'book', component: Booking }   // localhost:4200/book -> show booking form
If you create new component but forget to add here, you can never visit it.


# 4. app.component.ts + app.component.html - The Outer Shell
What it is: The main container that holds everything. All pages load INSIDE this.
You will modify? Once or twice only.
Simple meaning: It's the outer frame of your house. Inside it you have <router-outlet> which means "whatever page user visits, show it here". You usually keep Header/Navbar here.


# 5. core/services/api.ts - The Waiter / Delivery Boy

What it is: One central place to talk to your .NET API.
You will modify? FREQUENTLY. Every time you need new API.
Simple meaning: Instead of every component directly calling API (messy), all components call this waiter. Waiter goes to backend.
// Component says:
api.getRooms()

// Service does the real work:
http.get('https://localhost:7094/api/rooms')

# 6. core/models/room.ts - The Blueprint / ID Card
What it is: Defines shape of your data. What is a Room?
You will modify? Sometimes, when backend model changes.
Simple meaning: Tells TypeScript "A Room must have roomNumber, type, price". If you try to use room.price but blueprint says pricePerNight, it will give error. It saves you from mistakes.


# 7. features/rooms/room-list/room-list.ts - The Actual Room
What it is: One page/feature. This is where your real work happens.
You will modify? DAILY. This is your main file.

It has 3 parts:

imports: [CommonModule, FormsModule] -> What tools this room needs
class -> Logic (load rooms, delete room)
template -> HTML (what user sees)
Simple meaning: Each component is one room of your house. Kitchen has different work, Bedroom has different. room-list.ts is the Hall where you display rooms.


# 8. *.spec.ts Files - IGNORE FOR NOW
What it is: Test files.
You will modify? NEVER in learning phase.
Simple meaning: Like CCTV for testing. Companies use it, but for learning you can delete or ignore. That's why I told you to ignore api.spec.ts.

File	How often?	Why you touch it?
app.config.ts	Rare	To add global power like HttpClient, Router
app.routes.ts	Every new page	To add new road to new page
api.ts	Every new API endpoint	To add new method like getBookings()
room.ts (model)	When backend changes	To match C# model
room-list.ts	Daily	Your main logic + UI work
main.ts	Never	Leave it


# Our Daily Workflow is ALWAYS:
Create Model (if new) -> room.ts
Add method in Service -> api.ts
Create Component -> room-list.ts
Add Route -> app.routes.ts
Run ng serve and see it work

