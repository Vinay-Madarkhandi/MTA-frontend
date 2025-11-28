# Purchase Module - Complete Backend Requirements

## 📋 Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Payment Gateway Integration](#payment-gateway-integration)
5. [Business Logic](#business-logic)
6. [Security Requirements](#security-requirements)
7. [Technology Stack](#technology-stack)

---

## 1. Overview

This Purchase Module is designed similar to Tally's purchase functionality with integrated POS payment support. It handles complete purchase workflow from creation to payment completion with real-time updates.

**Key Features**:
- Complete purchase order management
- Supplier management
- Multi-item purchases with tax and discount calculations
- POS machine integration for payments
- Real-time payment status updates
- Stock management integration
- Invoice generation (PDF/Excel)

---

## 2. Database Schema

### 2.1 Purchases Table
```sql
CREATE TABLE purchases (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    purchase_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_contact VARCHAR(20),
    supplier_email VARCHAR(255),
    supplier_gst VARCHAR(15),
    supplier_address TEXT,
    purchase_date DATE NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    total_tax DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_discount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    shipping_charges DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    other_charges DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(15, 2) NOT NULL,
    payment_status ENUM('pending', 'partial', 'paid') NOT NULL DEFAULT 'pending',
    payment_method ENUM('cash', 'card', 'upi', 'netbanking', 'pos') DEFAULT 'pos',
    transaction_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    INDEX idx_purchase_number (purchase_number),
    INDEX idx_purchase_date (purchase_date),
    INDEX idx_payment_status (payment_status)
);
```

### 2.2 Purchase Items Table
```sql
CREATE TABLE purchase_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    purchase_id BIGINT NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(15, 2) NOT NULL,
    
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    INDEX idx_purchase_id (purchase_id)
);
```

### 2.3 Payment Transactions Table
```sql
CREATE TABLE payment_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    purchase_id BIGINT NOT NULL,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    payment_method ENUM('cash', 'card', 'upi', 'netbanking', 'pos') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'processing', 'success', 'failed') NOT NULL,
    gateway_response TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id)
);
```

### 2.4 POS Payment Sessions Table
```sql
CREATE TABLE pos_payment_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    purchase_id BIGINT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status ENUM('initiated', 'processing', 'completed', 'failed') DEFAULT 'initiated',
    payment_url TEXT,
    callback_data TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id)
);
```

---

## 3. API Endpoints

### 3.1 Purchase Management

#### `GET /api/purchases`
Get all purchases with filtering and pagination.

**Query Parameters**:
- `status`: Filter by payment status (pending/partial/paid)
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "purchaseNumber": "PUR-2024-0001",
      "supplierName": "ABC Suppliers",
      "supplierContact": "+91-9876543210",
      "purchaseDate": "2024-11-27",
      "grandTotal": 11600.00,
      "paymentStatus": "paid",
      "paymentMethod": "pos",
      "createdAt": "2024-11-27T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalPages": 5,
    "totalRecords": 100
  }
}
```

#### `POST /api/purchases`
Create a new purchase.

**Request Body**:
```json
{
  "supplierName": "ABC Suppliers",
  "supplierContact": "+91-9876543210",
  "supplierEmail": "abc@example.com",
  "supplierGST": "29ABCDE1234F1Z5",
  "supplierAddress": "123 Main St",
  "purchaseDate": "2024-11-27",
  "items": [
    {
      "productId": "101",
      "productName": "Product A",
      "quantity": 10,
      "unitPrice": 100.00,
      "taxRate": 18,
      "discountPercent": 5
    }
  ],
  "shippingCharges": 200.00,
  "otherCharges": 100.00,
  "notes": "Urgent delivery"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Purchase created successfully",
  "data": {
    "id": "1",
    "purchaseNumber": "PUR-2024-0001",
    "grandTotal": 11600.00,
    "paymentStatus": "pending"
  }
}
```

#### `GET /api/purchases/{id}`
Get purchase details by ID.

#### `GET /api/purchases/stats`
Get purchase statistics.

**Response**:
```json
{
  "success": true,
  "data": {
    "totalPurchases": 150,
    "pendingPayments": 25,
    "completedToday": 12,
    "totalAmount": 1500000.00
  }
}
```

---

### 3.2 Payment Endpoints

#### `POST /api/purchases/payment/pos/initiate`
Initiate POS payment.

**Request Body**:
```json
{
  "purchaseId": "1",
  "amount": 11600.00
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "SES-123456789",
    "paymentUrl": "https://pos-gateway.com/pay/SES-123456789",
    "expiresAt": "2024-11-27T11:00:00Z"
  }
}
```

#### `GET /api/purchases/payment/pos/verify/{sessionId}`
Verify payment status.

**Response**:
```json
{
  "success": true,
  "transactionId": "TXN123456789",
  "paymentStatus": "paid",
  "message": "Payment completed successfully",
  "timestamp": "2024-11-27T10:45:00Z"
}
```

#### `POST /api/purchases/payment/webhook`
Webhook for payment gateway callbacks (POS machine sends payment status here).

**Request Body**:
```json
{
  "sessionId": "SES-123456789",
  "transactionId": "TXN123456789",
  "status": "success",
  "amount": 11600.00,
  "signature": "encrypted_signature"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment status updated"
}
```

---

## 4. Payment Gateway Integration

### 4.1 Supported POS Providers
- **Razorpay POS**
- **Paytm EDC**
- **PhonePe POS**
- **Pine Labs**
- **Mswipe**

### 4.2 Integration Flow

```
1. User creates purchase → Backend generates purchase record
2. User clicks "Proceed to Payment" → Frontend calls /payment/pos/initiate
3. Backend creates payment session → Calls POS gateway API
4. POS gateway returns payment URL/session ID
5. Frontend redirects/displays to POS interface
6. Customer completes payment on POS machine
7. POS gateway sends webhook to backend
8. Backend verifies signature → Updates purchase payment status
9. Frontend polls /payment/pos/verify/{sessionId} to get updated status
10. Display success message and update UI
```

### 4.3 Configuration Required

**Environment Variables**:
```env
# Payment Gateway
PAYMENT_GATEWAY_PROVIDER=razorpay
PAYMENT_API_KEY=rzp_live_xxxxxxxxxxxxx
PAYMENT_API_SECRET=your_secret_key
PAYMENT_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
PAYMENT_CALLBACK_URL=https://yourdomain.com/api/purchases/payment/webhook

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mta_pos
DB_USER=root
DB_PASSWORD=your_password
```

### 4.4 Payment Security
- Verify webhook signature using HMAC SHA256
- Use HTTPS for all payment communications
- Store API secrets in environment variables (never in code)
- Implement rate limiting on payment endpoints
- Log all payment transactions

**Signature Verification Example**:
```java
public boolean verifyWebhookSignature(String payload, String signature) {
    String expectedSignature = HmacUtils.hmacSha256Hex(
        webhookSecret, 
        payload
    );
    return signature.equals(expectedSignature);
}
```

---

## 5. Business Logic

### 5.1 Purchase Number Generation
Auto-generate unique purchase numbers:
- Format: `PUR-YYYY-XXXX`
- Example: `PUR-2024-0001`, `PUR-2024-0002`
- Reset counter annually

**Implementation**:
```java
public String generatePurchaseNumber() {
    int year = LocalDate.now().getYear();
    int sequence = purchaseRepository.countByYear(year) + 1;
    return String.format("PUR-%d-%04d", year, sequence);
}
```

### 5.2 Calculations

**Item Calculations**:
```
Item Subtotal = Quantity × Unit Price
Discount Amount = (Item Subtotal × Discount %) / 100
Taxable Amount = Item Subtotal - Discount Amount
Tax Amount = (Taxable Amount × Tax Rate) / 100
Item Total = Taxable Amount + Tax Amount
```

**Purchase Totals**:
```
Subtotal = Sum of all Item Subtotals
Total Discount = Sum of all Discount Amounts
Total Tax = Sum of all Tax Amounts
Grand Total = Subtotal - Total Discount + Total Tax + Shipping + Other Charges
```

### 5.3 Stock Update Logic
When payment status changes to "paid":
1. Find all items in the purchase
2. For each item, update product stock:
   - `stock = stock + quantity`
3. Update product's last purchase price
4. Log stock movement in history table

**Implementation**:
```java
@Transactional
public void updateStockAfterPurchase(Purchase purchase) {
    for (PurchaseItem item : purchase.getItems()) {
        Product product = productRepository.findById(item.getProductId());
        product.setStock(product.getStock() + item.getQuantity());
        product.setPurchasePrice(item.getUnitPrice());
        productRepository.save(product);
        
        // Log stock movement
        stockMovementRepository.save(new StockMovement(
            product.getId(),
            "PURCHASE",
            item.getQuantity(),
            purchase.getPurchaseNumber()
        ));
    }
}
```

---

## 6. Security Requirements

### 6.1 Authentication
- Implement JWT-based authentication
- Token expiry: 24 hours
- Refresh token: 30 days

### 6.2 Authorization (RBAC)
**Roles**:
- `ADMIN`: Full access
- `PURCHASE_MANAGER`: Create, update, view purchases
- `ACCOUNTANT`: View purchases, process payments
- `VIEWER`: Read-only access

**Endpoint Protection**:
```java
@PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER')")
@PostMapping("/purchases")
public ResponseEntity<Purchase> createPurchase(@RequestBody PurchaseCommand cmd) {
    // ...
}
```

### 6.3 Data Validation
- Validate all input fields
- Sanitize user inputs
- Check for SQL injection attempts
- Validate GST number format
- Validate email format

---

## 7. Technology Stack

### 7.1 Recommended Backend Stack

**Option 1: Java/Spring Boot**
```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.2.0</version>
    </dependency>
    
    <!-- Spring Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- MySQL Driver -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
    </dependency>
    
    <!-- Payment Gateway SDK (Razorpay example) -->
    <dependency>
        <groupId>com.razorpay</groupId>
        <artifactId>razorpay-java</artifactId>
        <version>1.4.3</version>
    </dependency>
    
    <!-- PDF Generation -->
    <dependency>
        <groupId>com.itextpdf</groupId>
        <artifactId>itext7-core</artifactId>
        <version>7.2.5</version>
    </dependency>
    
    <!-- Excel Export -->
    <dependency>
        <groupId>org.apache.poi</groupId>
        <artifactId>poi-ooxml</artifactId>
        <version>5.2.3</version>
    </dependency>
</dependencies>
```

**Option 2: Node.js/Express**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "sequelize": "^6.33.0",
    "razorpay": "^2.9.2",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "pdfkit": "^0.13.0",
    "exceljs": "^4.3.0"
  }
}
```

### 7.2 Database
- **MySQL 8.0+** or **PostgreSQL 14+**
- Enable connection pooling
- Set up read replicas for scalability

### 7.3 Additional Tools
- **API Documentation**: Swagger/OpenAPI
- **Logging**: SLF4J + Logback (Java) or Winston (Node.js)
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry

---

## 8. Testing Requirements

### 8.1 Unit Tests
- Test all calculation functions
- Test purchase number generation
- Test validation logic

### 8.2 Integration Tests
- Test complete purchase creation flow
- Test payment gateway integration (use sandbox)
- Test webhook handling

### 8.3 Payment Gateway Testing
Use sandbox credentials provided by payment gateway:
- Test successful payment
- Test failed payment
- Test timeout scenarios
- Test webhook callbacks

---

## 9. Deployment Checklist

### 9.1 Pre-deployment
- [ ] Run database migrations
- [ ] Configure payment gateway credentials
- [ ] Set up SSL certificates
- [ ] Configure environment variables
- [ ] Test payment flow in sandbox mode
- [ ] Set up monitoring and alerts
- [ ] Configure automated backups

### 9.2 Post-deployment
- [ ] Switch to production payment gateway credentials
- [ ] Monitor first few transactions
- [ ] Set up log aggregation
- [ ] Configure webhook URL with payment gateway
- [ ] Test end-to-end purchase and payment flow

---

## 10. API Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "supplierName",
      "message": "Supplier name is required"
    }
  ]
}
```

---

## 11. Next Steps

1. **Set up backend project**
   - Initialize Spring Boot/Node.js project
   - Configure database connection
   - Set up project structure

2. **Implement database schema**
   - Create migration scripts
   - Run migrations
   - Verify tables created

3. **Develop API endpoints**
   - Implement purchase CRUD operations
   - Implement payment endpoints
   - Add authentication/authorization

4. **Integrate payment gateway**
   - Sign up for payment gateway account
   - Get sandbox credentials
   - Implement payment initiation
   - Implement webhook handler

5. **Testing**
   - Write unit tests
   - Test payment flow in sandbox
   - Perform integration testing

6. **Connect with frontend**
   - Test API endpoints with Postman
   - Integrate with React frontend
   - Test complete flow

---

## 📞 Support & Questions

For any clarifications or additional requirements, please reach out to the development team.

**Document Version**: 1.0  
**Last Updated**: November 27, 2024
