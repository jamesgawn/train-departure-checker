# AWS Lambda Javascript Example
A sample project with a example structure to speed up creating, testing, and publishing a lambda function using terraform.

You will need to initialise the terraform state, which is stored by default in an S3 bucket, using your AWS credentials. This example project sources the credentials from a shared credentials file as described on with [AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-config-files.html).

```
terraform init -backend-config="profile=default"
```

If this initialises successfully you will be able to build & deploy the lambda function using the following set of commands:

Command | Description
--- | ----
npm run build | This will build the packaged code in the form of a zip file that can be deployed as a lambda function
npm run deploy-validate | This will run the terraform validation process to inform you what will change
npm run deploy | This will build & deploy (via terraform) the lambda function
npm run destroy | This will remove the lambda function from AWS
