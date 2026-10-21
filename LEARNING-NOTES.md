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


