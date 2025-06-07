variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where Redis will be deployed"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs where Redis will be deployed"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs for Redis"
  type        = list(string)
}

variable "node_type" {
  description = "Instance type for Redis nodes"
  type        = string
}

variable "num_nodes" {
  description = "Number of Redis nodes"
  type        = number
} 