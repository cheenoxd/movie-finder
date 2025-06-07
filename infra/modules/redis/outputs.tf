output "endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_cluster.this.cache_nodes[0].address
}

output "port" {
  description = "Redis port"
  value       = aws_elasticache_cluster.this.port
}

output "cluster_id" {
  description = "Redis cluster ID"
  value       = aws_elasticache_cluster.this.cluster_id
} 