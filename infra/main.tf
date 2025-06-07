# VPC and Networking
module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
}

# OpenSearch (Elasticsearch)
module "opensearch" {
  source = "./modules/opensearch"

  project_name         = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.private_subnet_ids
  instance_type         = var.opensearch_instance_type
  instance_count        = var.opensearch_instance_count
  volume_size          = var.opensearch_volume_size
  security_group_ids   = [module.vpc.opensearch_security_group_id]
}

# Redis (ElastiCache)
module "redis" {
  source = "./modules/redis"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  node_type       = var.redis_node_type
  num_nodes       = var.redis_num_nodes
  security_group_ids = [module.vpc.redis_security_group_id]
} 