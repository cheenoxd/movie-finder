resource "aws_elasticache_cluster" "this" {
  cluster_id           = "${var.project_name}-${var.environment}"
  engine              = "redis"
  node_type           = var.node_type
  num_cache_nodes     = var.num_nodes
  port                = 6379
  subnet_group_name   = aws_elasticache_subnet_group.this.name
  security_group_ids  = var.security_group_ids

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_elasticache_subnet_group" "this" {
  name       = "${var.project_name}-${var.environment}-redis-subnet"
  subnet_ids = var.subnet_ids
} 