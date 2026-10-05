# StayFinder

StayFinder is a Node.js web application built with Express, MongoDB, EJS, and Passport for user authentication and property listing management.

## Prerequisites

Before running the project, make sure you have installed:

- Node.js (recommended LTS version)
- npm
- MongoDB

## Install all npm packages

From the project root, run:

```bash
npm install
```

This will install all packages listed in `package.json`.

If you want to install the dependencies manually, use:

```bash
npm install cloudinary connect-flash cookie-parser dotenv ejs ejs-mate express express-session joi method-override mongoose multer multer-storage-cloudinary passport passport-local passport-local-mongoose
```

## Main dependencies used in this project

- `express` — web server framework
- `ejs` — templating engine
- `ejs-mate` — layout support for EJS
- `mongoose` — MongoDB ODM
- `dotenv` — environment variable management
- `passport` — authentication
- `passport-local` — local auth strategy
- `passport-local-mongoose` — password hashing and user auth helpers
- `express-session` — session handling
- `connect-flash` — flash messages
- `cookie-parser` — cookie parsing
- `multer` — file uploads
- `cloudinary` — cloud image hosting
- `multer-storage-cloudinary` — Cloudinary storage for uploaded files
- `joi` — validation
- `method-override` — support for PUT/DELETE methods in HTML forms

## Environment variables

Create a `.env` file in the project root and add values similar to:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/stayfinder
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Run the project

```bash
node app.js
```

or if you add a start script later:

```bash
npm start
```

## Project structure

- `app.js` — main application entry
- `routes/` — route definitions
- `models/` — Mongoose models
- `controller/` — logic for controllers
- `views/` — EJS templates
- `public/` — static files
- `middleware.js` — custom middleware
- `cloudConfig.js` — Cloudinary configuration

## Notes

If `node_modules` is already present, you can skip installation. Otherwise, running `npm install` is the simplest way to install everything required for this project.
