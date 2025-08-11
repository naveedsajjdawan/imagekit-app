# Setup Guide for My AI App

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your-database-name?retryWrites=true&w=majority

# NextAuth Configuration (if you plan to use it)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## MongoDB Setup

1. **Create a MongoDB Atlas account** (free tier available)
2. **Create a new cluster**
3. **Get your connection string** from the cluster
4. **Replace the placeholder values** in your `.env.local` file

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Bugs Fixed

✅ **Registration API Status Code**: Fixed incorrect 400 status for successful registration  
✅ **Frontend Response Check**: Fixed `!res` to `!res.ok` for proper error handling  
✅ **Database Connection**: Fixed missing assignment to `cached.promise`  
✅ **Input Validation**: Added proper form validation and error handling  
✅ **Loading States**: Added loading state for better UX  
✅ **Error Handling**: Improved error messages and logging  

## Testing Registration

1. Navigate to `/register`
2. Fill in email and password (minimum 6 characters)
3. Confirm password matches
4. Submit the form
5. Check browser console for any errors
6. Verify user is created in MongoDB
