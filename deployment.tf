variable "profile" {
  type = "string",
  default = "ana"
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