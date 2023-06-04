# Changelog

## V.0.0.2

### Features

- Added Register route
  - Users can now create a new account for free.
  - Email must be unique
  - No requirement for password strength nor email validity (to be added when needed)
- Added Log In route
  - Registered users can access this route to retrieve their token and perform authenticated requests
- Added /profile
  - Authenticated route that returns current user information

#### Library

- Added /library
  - As admin you can now generate new library (need to be reworked)
  - As user, you can retrieve all lessons available
- Added next lesson
  - Add route for user to set progression to next lesson

## V0.0.1

### Architecture

- Init NestJS application
- Configure prettier & eslint
- Configure database access

### Core module

- Define global DTO for every response emitted by the API
- Configure global filters (exception catcher etc..)

### Auth Module

- AuthController
- AuthService
- AuthGuard
- LocalGuard
- AdminGuard
- CurrentUser decorator

### Users module

- UserController
- UserProfile
- UserService

### Library module

- LibraryController
- LibraryService
- PdfUploader
- CoursesGenerator
