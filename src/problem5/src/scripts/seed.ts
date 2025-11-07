import { DatabaseService } from '../config/database';
import { ResourceService } from '../services/resource.service';
import { CreateResourceDTO } from '../models/resource.model';

const resourceService = new ResourceService();

const dummyResources: CreateResourceDTO[] = [
  {
    name: 'Web API Documentation',
    description: 'Comprehensive REST API documentation for web services',
    category: 'technology',
    status: 'active'
  },
  {
    name: 'Mobile App Development',
    description: 'iOS and Android mobile application development resources',
    category: 'mobile',
    status: 'active'
  },
  {
    name: 'Cloud Infrastructure',
    description: 'AWS, Azure, and GCP cloud infrastructure guides',
    category: 'technology',
    status: 'active'
  },
  {
    name: 'Database Design Patterns',
    description: 'Best practices for relational and NoSQL database design',
    category: 'database',
    status: 'active'
  },
  {
    name: 'Legacy System Migration',
    description: 'Guide for migrating from legacy systems to modern architecture',
    category: 'technology',
    status: 'inactive'
  },
  {
    name: 'UI/UX Design Guidelines',
    description: 'Modern user interface and experience design principles',
    category: 'design',
    status: 'active'
  },
  {
    name: 'Security Best Practices',
    description: 'Application security and vulnerability management',
    category: 'security',
    status: 'active'
  },
  {
    name: 'DevOps Pipeline Setup',
    description: 'CI/CD pipeline configuration and automation',
    category: 'technology',
    status: 'active'
  },
  {
    name: 'Old Marketing Campaign',
    description: 'Q1 2024 marketing campaign materials and analytics',
    category: 'marketing',
    status: 'archived'
  },
  {
    name: 'Machine Learning Models',
    description: 'Pre-trained ML models for common use cases',
    category: 'ai',
    status: 'active'
  },
  {
    name: 'API Rate Limiting',
    description: 'Implementation guide for API throttling and rate limits',
    category: 'technology',
    status: 'active'
  },
  {
    name: 'Customer Support Portal',
    description: 'Self-service customer support documentation portal',
    category: 'support',
    status: 'inactive'
  },
  {
    name: 'E-commerce Platform',
    description: 'Full-stack e-commerce solution with payment integration',
    category: 'business',
    status: 'active'
  },
  {
    name: 'Video Streaming Service',
    description: 'Live and on-demand video streaming infrastructure',
    category: 'media',
    status: 'active'
  },
  {
    name: 'Analytics Dashboard',
    description: 'Real-time business analytics and reporting dashboard',
    category: 'analytics',
    status: 'active'
  },
  {
    name: 'Authentication System',
    description: 'OAuth2 and JWT-based authentication service',
    category: 'security',
    status: 'active'
  },
  {
    name: 'Backup Solution',
    description: 'Automated backup and disaster recovery system',
    category: 'technology',
    status: 'active'
  },
  {
    name: 'Testing Framework',
    description: 'Unit, integration, and e2e testing framework setup',
    category: 'technology',
    status: 'inactive'
  },
  {
    name: 'API Gateway',
    description: 'Centralized API gateway with routing and load balancing',
    category: 'technology',
    status: 'active'
  },
  {
    name: 'Content Management System',
    description: 'Headless CMS for managing digital content',
    category: 'business',
    status: 'active'
  }
];

async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Initialize database
    DatabaseService.getInstance();

    let successCount = 0;
    let errorCount = 0;

    for (const resource of dummyResources) {
      try {
        const created = resourceService.create(resource);
        console.log(`✅ Created: ${created.name} (ID: ${created.id})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create: ${resource.name}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Seeding completed!`);
    console.log(`   Successfully created: ${successCount} resources`);
    if (errorCount > 0) {
      console.log(`   Failed: ${errorCount} resources`);
    }
    console.log('='.repeat(50));

    // Summary by category
    const allResources = resourceService.getAll();
    const categories = [...new Set(allResources.map(r => r.category))];
    console.log('\n📊 Resources by category:');
    categories.forEach(category => {
      const count = allResources.filter(r => r.category === category).length;
      console.log(`   ${category}: ${count}`);
    });

    // Summary by status
    console.log('\n📈 Resources by status:');
    const statuses: ('active' | 'inactive' | 'archived')[] = ['active', 'inactive', 'archived'];
    statuses.forEach(status => {
      const count = allResources.filter(r => r.status === status).length;
      console.log(`   ${status}: ${count}`);
    });

    console.log('\n✅ Total resources in database:', allResources.length);
    console.log('\n💡 Run "npm run dev" to start the server\n');

    DatabaseService.getInstance().close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();
