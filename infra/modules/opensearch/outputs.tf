output "endpoint" {
  description = "OpenSearch domain endpoint"
  value       = aws_opensearch_domain.this.endpoint
}

output "dashboard_url" {
  description = "OpenSearch dashboard URL"
  value       = "https://${aws_opensearch_domain.this.endpoint}/_dashboards/"
}

output "domain_name" {
  description = "OpenSearch domain name"
  value       = aws_opensearch_domain.this.domain_name
} 