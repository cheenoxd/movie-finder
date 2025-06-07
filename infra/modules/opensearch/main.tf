resource "aws_opensearch_domain" "this" {
  domain_name    = "${var.project_name}-${var.environment}"
  engine_version = "OpenSearch_2.3"

  cluster_config {
    instance_type  = var.instance_type
    instance_count = var.instance_count
  }

  ebs_options {
    ebs_enabled = true
    volume_size = var.volume_size
  }

  vpc_options {
    subnet_ids = [var.subnet_ids[0]]
    security_group_ids = var.security_group_ids
  }

  encrypt_at_rest {
    enabled = true
  }

  node_to_node_encryption {
    enabled = true
  }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
} 