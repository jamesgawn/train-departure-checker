variable "profile" {
  type = "string",
  default = "terraform"
}

variable "region" {
  type = "string",
  default = "eu-west-2"
}

variable "nrdp_user" {
  type = "string"
}

variable "nrdp_pass" {
  type = "string"
}

variable "darwin_token" {
  type = "string"
}

variable "s3_bucket_name" {
  type = "string"
}

provider "aws" {
  region = "${var.region}"
  profile = "${var.profile}"
}

terraform {
  backend "s3" {
    bucket = "ana-terraform-state-prod"
    key = "train-departure-checker/terraform.tfstate"
    region = "eu-west-2"
  }
}

resource "aws_lambda_function" "rail_station_retrieval_lambda" {
  function_name = "rail-station-retrevial"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler = "station-lambda.handler"
  runtime = "nodejs8.10"
  filename = "dist-lambda.zip"
  memory_size = 512
  timeout = 90
  environment {
    variables {
      NRDP_USER = "${var.nrdp_user}",
      NRDP_PASS = "${var.nrdp_pass}"
    }
  }

  role = "${aws_iam_role.lambda_execution_role.arn}"
}

data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# IAM role which dictates what other AWS services the Lambda function
# may access.
resource "aws_iam_role" "lambda_execution_role" {
  name = "rail-lambda-execution-role"

  assume_role_policy = "${data.aws_iam_policy_document.lambda_assume_role_policy.json}"
}

data "aws_iam_policy_document" "cloudwatch-log-group-lambda" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "*",
    ]
  }
}

resource "aws_iam_role_policy" "lambda-cloudwatch-log-group" {
  name = "rail-lambda-cloudwatch-log-group"
  role = "${aws_iam_role.lambda_execution_role.name}"
  policy = "${data.aws_iam_policy_document.cloudwatch-log-group-lambda.json}"
}

data "aws_iam_policy_document" "rail_s3_bucket_access_iam_policy_document" {
  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject"
    ]
    resources = [
      "${aws_s3_bucket.rail_bucket.arn}",
    ]
  }
}

resource "aws_iam_role_policy" "rail_s3_bucket_access_iam_role_policy" {
  name = "rail_s3_bucket_access"
  role = "${aws_iam_role.lambda_execution_role.name}"
  policy = "${data.aws_iam_policy_document.rail_s3_bucket_access_iam_policy_document.json}"
}

resource "aws_s3_bucket" "rail_bucket" {
  bucket = "${var.s3_bucket_name}"
  acl = "private"
}