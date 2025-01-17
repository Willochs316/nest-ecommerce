export enum Role {
    Customer = 'CUSTOMER',
    Vendor = 'VENDOR',
    CustomerService = 'CUSTOMER_SERVICE',
    AccountOfficer = 'ACCOUNT_OFFICER',
    ProductManager = 'PRODUCT_MANAGER',
    DeliveryManager = 'DELIVERY_AGENT',
    LogisticsAgent = "LOGISTICS_AGENT",
    Admin = 'ADMIN',
    SuperAdmin = 'SUPER_ADMIN',
}

export enum ActivityState {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum OrderStatus {
    PENDING = 'PENDING',
    ASSIGNED = 'ASSIGNED',
    RESCHEDULED = 'RESCHEDULED',
    REJECTED = 'REJECTED',
    APPROVED = 'APPROVED',
    DELIVERED = 'DELIVERED',
}