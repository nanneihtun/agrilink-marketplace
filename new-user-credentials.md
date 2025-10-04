# New User Accounts - Gmail Pattern

## 🔐 Login Credentials
**Password for all accounts**: `123456`

## 👥 User Accounts (12 total)

### 🌾 **Farmers (4 accounts)**

#### **Individual Farmers:**
1. **farmerindi1@gmail.com**
   - **Name**: Aung Min
   - **Type**: Farmer (Individual)
   - **Location**: Mandalay Region, Mandalay
   - **Status**: Unverified
   - **Phone**: +959123456789

2. **farmerindi2@gmail.com**
   - **Name**: Thida Win
   - **Type**: Farmer (Individual)
   - **Location**: Yangon Region, Yangon
   - **Status**: Verified
   - **Phone**: +959123456790

#### **Business Farmers:**
3. **farmerbiz1@gmail.com**
   - **Name**: Green Valley Farm
   - **Type**: Farmer (Business)
   - **Location**: Sagaing Region, Monywa
   - **Status**: Unverified
   - **Phone**: +959123456791
   - **Business**: Organic farming specializing in rice and vegetables

4. **farmerbiz2@gmail.com**
   - **Name**: Golden Harvest Co.
   - **Type**: Farmer (Business)
   - **Location**: Bago Region, Bago
   - **Status**: Verified
   - **Phone**: +959123456792
   - **Business**: Large-scale agricultural production and export

### 🛒 **Traders (4 accounts)**

#### **Individual Traders:**
5. **traderindi1@gmail.com**
   - **Name**: Ko Myint
   - **Type**: Trader (Individual)
   - **Location**: Mandalay Region, Mandalay
   - **Status**: Unverified
   - **Phone**: +959123456793

6. **traderindi2@gmail.com**
   - **Name**: Daw Hla
   - **Type**: Trader (Individual)
   - **Location**: Yangon Region, Yangon
   - **Status**: Verified
   - **Phone**: +959123456794

#### **Business Traders:**
7. **traderbiz1@gmail.com**
   - **Name**: Myanmar Trade Hub
   - **Type**: Trader (Business)
   - **Location**: Yangon Region, Yangon
   - **Status**: Unverified
   - **Phone**: +959123456795
   - **Business**: Agricultural commodity trading and distribution

8. **traderbiz2@gmail.com**
   - **Name**: AgriConnect Trading
   - **Type**: Trader (Business)
   - **Location**: Mandalay Region, Mandalay
   - **Status**: Verified
   - **Phone**: +959123456796
   - **Business**: Premium agricultural products export and import

### 🛍️ **Buyers (4 accounts)**

#### **Individual Buyers:**
9. **buyerindi1@gmail.com**
   - **Name**: Min Ko
   - **Type**: Buyer (Individual)
   - **Location**: Yangon Region, Yangon
   - **Status**: Unverified
   - **Phone**: +959123456797

10. **buyerindi2@gmail.com**
    - **Name**: Daw Nwe
    - **Type**: Buyer (Individual)
    - **Location**: Mandalay Region, Mandalay
    - **Status**: Verified
    - **Phone**: +959123456798

#### **Business Buyers:**
11. **buyerbiz1@gmail.com**
    - **Name**: Fresh Market Chain
    - **Type**: Buyer (Business)
    - **Location**: Yangon Region, Yangon
    - **Status**: Unverified
    - **Phone**: +959123456799
    - **Business**: Retail chain specializing in fresh agricultural products

12. **buyerbiz2@gmail.com**
    - **Name**: Premium Groceries Ltd
    - **Type**: Buyer (Business)
    - **Location**: Mandalay Region, Mandalay
    - **Status**: Verified
    - **Phone**: +959123456800
    - **Business**: High-end grocery stores and wholesale distribution

## 🚀 **Setup Instructions**

### 1. **Create Users in Database**
Run the SQL script in Supabase SQL Editor:
```sql
-- Copy and paste the content from create-12-new-users.sql
```

### 2. **Set Up Authentication**
Run the Node.js script:
```bash
node setup-user-auth.js
```

### 3. **Add Products (Optional)**
Run the products script to add sample products:
```sql
-- Copy and paste the content from add-products-to-users.sql
```

## ✅ **Verification Status**
- **6 Unverified users**: Red "Unverified" badges
- **6 Verified users**: Green "Verified" or "Business ✓" badges

## 🎯 **Account Types**
- **Individual**: Personal accounts (6 users)
- **Business**: Company accounts (6 users)

All users can login with their email and password `123456`!
