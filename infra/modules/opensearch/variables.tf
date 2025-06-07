variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where OpenSearch will be deployed"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs where OpenSearch will be deployed"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs for OpenSearch"
  type        = list(string)
}

variable "instance_type" {
  description = "Instance type for OpenSearch nodes"
  type        = string
}

variable "instance_count" {
  description = "Number of OpenSearch nodes"
  type        = number
}

variable "volume_size" {
  description = "EBS volume size for OpenSearch nodes (in GB)"
  type        = number
} 