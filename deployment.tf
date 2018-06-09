variable "profile" {
  type = "string",
  default = "terraform"
}

variable "region" {
  type = "string",
  default = "eu-west-2"
}

provider "aws" {
  region = "${var.region}"
  profile = "${var.profile}"
}

terraform {
  backend "s3" {
    bucket = "ana-terraform-state-prod"
    key = "aws-lambda-function-terraform-example/terraform.tfstate"
    region = "eu-west-2"
  }
}

resource "aws_lambda_function" "example" {
  function_name = "LambdaExample"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler = "lambda.handler"
  runtime = "nodejs8.10"
  filename = "dist-lambda.zip"

  role = "${aws_iam_role.lambda_exec.arn}"
}

# IAM role which dictates what other AWS services the Lambda function
# may access.
resource "aws_iam_role" "lambda_exec" {
  name = "lambda_example_execution_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}