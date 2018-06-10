# AWS Lambda Terraform Example
A simple set of restful APIs to retrieve train departure information from national rail.

You will need to initialise the terraform state, which is stored by default in an S3 bucket, using your AWS credentials. This example project sources the credentials from a shared credentials file as described on with [AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-config-files.html).

```
terraform init -backend-config="profile=default"
```

If this initialises successfully you will be able to build & deploy the lambda function using the following set of commands:

Command | Description
--- | ----
npm run build | This will build the packaged code in the form of a zip file that can be deployed as a lambda function.
npm run deploy-plan | This will provide a preview of the changes that terraform will make upon a deployment.
npm run deploy | This will build & deploy (via terraform) the lambda function.
npm run destroy | This will remove the lambda function from AWS.
