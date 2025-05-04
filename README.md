
# Screenshots multi-language manual transcripter

A Next.js application that allows users to upload *pages* (a *page* is basically a screenshot from a specific Newspaper, or from a specific Website), select areas for transcription, and automatically generate transcriptions with translations.

![Screenshot](screenshot.png)


## Features

- Drag and drop to upload the newspaper pages, and positionate them like you want
- Select areas for transcription
- Automatic text recognition using OpenAI's GPT-4 Vision
- French translations of transcriptions
- Drag and drop interface for page positioning

## Prerequisites

- Node.js 18+ and npm
- MySQL database
- AWS S3 bucket
- OpenAI API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/database_name"

# AWS S3
AWS_REGION="your-region"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_BUCKET_NAME="your-bucket-name"
NEXT_PUBLIC_S3_BASE_URL=https://<bucket-name>.s3.eu-west-3.amazonaws.com

# OpenAI
OPENAI_API_KEY="your-openai-api-key"
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/stouch/newspaper-screenshots-transcripter.git
cd newspaper-screenshots-transcripter
```

2. Install dependencies:
```bash
nvm use
npm ci
```

3. Set up the database:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.
