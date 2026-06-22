# Cloudflare R2 Upload Function

This document describes the new `uploadtoR2` function that has been added to upload files to Cloudflare R2 storage.

## Overview

The `uploadtoR2` function is located in `/app/bem.js` and provides a simple way to upload files to Cloudflare R2 storage using direct HTTP requests with AWS Signature V4 authentication. **No external dependencies required** - uses only Node.js built-in modules.

## Function Signature

```javascript
async function uploadtoR2(filePath, folder)
```

### Parameters

- `filePath` (string): The local path to the file to upload
- `folder` (string): The folder path in R2 bucket (e.g., 'images/', 'documents/')

### Returns

- `Promise<Object>`: The upload response containing the file URL and metadata

## Required Environment Variables

Add these environment variables to your `.env` file:

```env
# Cloudflare R2 Configuration
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET=your_r2_bucket_name
R2_REGION=auto
```

## How to Get R2 Credentials

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Create a new R2 bucket if you haven't already
4. Go to "Manage R2 API tokens"
5. Create a new API token with R2 permissions
6. Use the Access Key ID and Secret Access Key in your environment variables
7. The endpoint URL format is: `https://<account-id>.r2.cloudflarestorage.com`

## Usage Example

```javascript
const { uploadtoR2 } = require('./app/bem.js');

async function uploadFile() {
    try {
        const result = await uploadtoR2('/path/to/file.jpg', 'images/');
        console.log('File uploaded to:', result.Location);
        return result;
    } catch (error) {
        console.error('Upload failed:', error);
    }
}
```

## Response Object

The function returns an object with the following properties:

```javascript
{
    Location: "https://your-bucket.your-account-id.r2.cloudflarestorage.com/images/filename.jpg",
    Bucket: "your-bucket-name",
    Key: "images/filename.jpg",
    ETag: "\"d41d8cd98f00b204e9800998ecf8427e\"",
    // ... other S3-compatible response properties
}
```

## Error Handling

The function will throw an error if:
- The file doesn't exist at the specified path
- Invalid R2 credentials
- Network connectivity issues
- R2 bucket doesn't exist or is inaccessible
- Insufficient permissions

## Comparison with S3 Upload

The `uploadtoR2` function is similar to the existing `uploadtoS3` function but uses direct HTTP requests instead of the AWS SDK:

| Feature | S3 | R2 |
|---------|----|----|
| SDK | AWS SDK | **No external dependencies** |
| Dependencies | aws-sdk package | Node.js built-in modules only |
| Authentication | AWS SDK handles it | Manual AWS Signature V4 |
| Endpoint | AWS S3 endpoints | R2 custom endpoint |
| Region | AWS regions | 'auto' (recommended) |
| Bundle Size | Larger (AWS SDK) | Minimal (no extra packages) |

## Notes

- **Zero Dependencies**: Uses only Node.js built-in modules (crypto, https, fs, path)
- **AWS Signature V4**: Implements proper AWS authentication for R2 compatibility
- **S3-Compatible**: R2 uses the same API as S3, so we implement the same authentication
- R2 doesn't require a specific region, so 'auto' is recommended
- Make sure your R2 bucket has the appropriate CORS settings if you plan to serve files directly from R2
- **Memory Efficient**: Reads file into memory for upload (consider streaming for very large files)

## Testing

You can test the function using the provided example file:

```bash
node example-r2-upload.js
```

Make sure to:
1. Set up your environment variables
2. Replace the example file path with a real file
3. Ensure the file exists before running the test
