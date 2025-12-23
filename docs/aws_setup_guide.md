# AWS S3 Setup Guide for Avatar Uploads

To enable avatar uploads in your CRM, you need to configure an AWS S3 bucket and update your environment variables.

## 1. Create an AWS S3 Bucket

1.  Log in to the [AWS Management Console](https://aws.amazon.com/console/).
2.  Navigate to **S3**.
3.  Click **Create bucket**.
4.  **Bucket name**: Enter a unique name (e.g., `mateluxy-crm-avatars-yourname`).
5.  **Region**: Choose a region close to your users (e.g., `us-east-1` or `ap-south-1`).
6.  **Object Ownership**: Select **ACLs enabled** and **Bucket owner preferred**.
7.  **Block Public Access settings**:
    *   Uncheck **Block all public access**.
    *   Check the warning box that appears.
    *   *Note: This is required so that the uploaded avatars can be publicly viewed in the app.*
8.  Click **Create bucket**.

## 2. Configure Bucket Policy (Optional but Recommended)

To ensure files are readable:

1.  Click on your newly created bucket.
2.  Go to the **Permissions** tab.
3.  Scroll down to **Bucket policy** and click **Edit**.
4.  Paste the following policy (replace `YOUR_BUCKET_NAME` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

## 3. Create IAM User for Access

1.  Navigate to **IAM** in the AWS Console.
2.  Click **Users** -> **Create user**.
3.  **User name**: Enter a name (e.g., `crm-s3-uploader`).
4.  Click **Next**.
5.  **Permissions options**: Select **Attach policies directly**.
6.  Search for `AmazonS3FullAccess` and select it.
    *   *For better security, you can create a custom policy that only allows `PutObject` and `GetObject` on your specific bucket.*
7.  Click **Next** -> **Create user**.
8.  Click on the newly created user.
9.  Go to the **Security credentials** tab.
10. Scroll to **Access keys** and click **Create access key**.
11. Select **Application running outside AWS**, then click **Next**.
12. Click **Create access key**.
13. **Copy the Access Key ID and Secret Access Key**. You will not be able to see the secret key again!

## 4. Update Environment Variables

Open your `Backend/.env` file and update the following variables with your values:

```env
AWS_REGION=us-east-1          # The region you selected (e.g., us-east-1, ap-south-1)
AWS_ACCESS_KEY_ID=AKIA...     # Your Access Key ID
AWS_SECRET_ACCESS_KEY=...     # Your Secret Access Key
AWS_BUCKET_NAME=...           # Your Bucket Name
```

## 5. Restart Backend

After updating the `.env` file, restart your backend server for the changes to take effect:

```bash
# In the Backend directory
npm run start:dev
```
