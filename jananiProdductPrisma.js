// schema.prisma

// Category model
model Category {
    id        String   @id @default(autoincrement())
    name      String   @unique
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }
  
  // Filter model
  model Filter {
    id                String     @id @default(autoincrement())
    name              String
    categoryId        String
    category          Category   @relation(fields: [categoryId], references: [id])
    specificationId   String
    specification     Specification @relation(fields: [specificationId], references: [id])
    createdAt         DateTime   @default(now())
    updatedAt         DateTime   @updatedAt
  }
  
  // Specification model
  model Specification {
    id            String   @id @default(autoincrement())
    name          String
    categoryId    String
    category      Category @relation(fields: [categoryId], references: [id])
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
  }
  
  // ChildFilter model
  model ChildFilter {
    id               String   @id @default(autoincrement())
    name             String
    filterId         String
    filter           Filter   @relation(fields: [filterId], references: [id])
    status           String
    createdAt        DateTime @default(now())
    updatedAt        DateTime @updatedAt
  }
  
  // Product model
  model Product {
    id                  String    @id @default(autoincrement())
    categoryId          String
    category            Category  @relation(fields: [categoryId], references: [id])
    filters             ChildFilter[]
    specifications      Specification[]
    name                String
    price               Float
    hotDeal             Boolean   @default(true)
    createdAt           DateTime  @default(now())
    updatedAt           DateTime  @updatedAt
  }

//2nd time
// schema.prisma

// Category model
model Category {
    category_id  String   @id @default(autoincrement())
    name         String
    products     Product[]
  }
  
  // Filter model
  model Filter {
    filter_id            String    @id @default(autoincrement())
    name                 String
    child_filters        ChildFilter[]
    products             Product[]
  }
  
  // ChildFilter model
  model ChildFilter {
    child_filter_id      String   @id @default(autoincrement())
    name                 String
    filter               Filter   @relation(fields: [filter_id], references: [filter_id])
  }
  
  // Specification model
  model Specification {
    specification_id     String   @id @default(autoincrement())
    name                 String
    specification_details SpecificationDetails[]
  }
  
  // SpecificationDetails model
  model SpecificationDetails {
    specification_details_id   String   @id @default(autoincrement())
    value                      String
    specification              Specification   @relation(fields: [specification_id], references: [specification_id])
  }
  
  // Product model
  model Product {
    product_id         String    @id @default(autoincrement())
    category_id        String
    name               String
    price              Float
    hot_deal           Boolean
    category           Category  @relation(fields: [category_id], references: [category_id])
    filters            Filter[]   @relation("ProductFilters", references: [filter_id])
    specification_details SpecificationDetails[] @relation("ProductSpecificationDetails")
  }
  
  