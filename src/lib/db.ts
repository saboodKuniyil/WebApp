
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Project } from '@/components/project-management/projects-list';
import type { Task } from '@/components/project-management/tasks-list';
import type { Issue } from '@/components/project-management/issues-list';
import type { TaskBlueprint } from '@/components/project-management/task-blueprints-list';
import type { Product } from '@/components/purchase/products-list';
import type { Currency } from '@/components/settings/currency-management';
import type { Estimation, EstimationTask } from '@/components/sales/estimations-list';

// Define types for the new Payroll module
export type Employee = {
  id: string;
  name: string;
  positionId: string;
  email: string;
  phone: string;
  hireDate: string;
};

export type Position = {
  id: string;
  title: string;
  department: string;
  baseSalary: number;
};

export type User = {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'User';
    status: 'active' | 'inactive';
}

export type Permissions = {
  view_dashboard: boolean;
  manage_projects: boolean;
  manage_tasks: boolean;
  manage_purchase_module: boolean;
  manage_crm_module: boolean;
  manage_payroll_module: boolean;
  manage_settings: boolean;
  manage_users: boolean;
};

export type UserRole = {
  id: string;
  name: string;
  description: string;
  permissions: Permissions;
};

export type DashboardSettings = {
  showFinancialStats: boolean;
  showRevenueChart: boolean;
  showSalesAnalysis: boolean;
  showProjectManagementStats?: boolean;
  showCrmStats?: boolean;
  showPurchaseStats?: boolean;
};

export type CompanyProfile = {
  companyName: string;
  trnNumber: string;
  logoUrl: string;
  address: string;
  bankName: string;
  accountNumber: string;
  iban: string;
};

export type EnabledModules = {
    project_management: boolean;
    purchase: boolean;
    crm: boolean;
    payroll: boolean;
    user_management: boolean;
    sales: boolean;
    accounting: boolean;
}

export type QuotationSettings = {
  termsAndConditions: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  taxPercentage: number;
  sendingEmail: string;
  receivingEmail: string;
};

export type AppSettings = {
    currency: string;
    dashboard?: DashboardSettings;
    enabled_modules?: EnabledModules;
    quotationSettings?: QuotationSettings;
};

export type EstimationItem = {
    id: string; // Can be product ID or a generated ID for adhoc items
    name: string;
    quantity: number;
    cost: number;
    type: 'product' | 'adhoc';
    size?: string;
    color?: string;
    model?: string;
    notes?: string;
    imageUrl?: string;
};

export type QuotationItem = {
    id: string;
    title: string;
    description?: string;
    quantity: number;
    rate: number;
    imageUrl?: string;
    marginPercentage?: number;
    marginAmount?: number;
};

export type Quotation = {
    id: string;
    title: string;
    estimationId: string;
    items: QuotationItem[];
    subtotal: number;
    marginPercentage: number;
    marginAmount: number;
    totalCost: number;
    status: 'draft' | 'sent' | 'approved' | 'rejected' | 'converted';
    customer: string;
    createdDate: string;
};


export type Vendor = {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive';
};

export type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive';
    companyName?: string;
    trnNumber?: string;
};

// Accounting Types
export type Account = {
    id: string;
    name: string;
    type: string;
    description: string;
    balance: number;
};

export type JournalEntry = {
    accountId: string;
    debit?: number;
    credit?: number;
};

export type Journal = {
    id: string;
    date: string;
    notes: string;
    entries: JournalEntry[];
}

// Sales Order Types
export type SalesOrderItem = QuotationItem;

export type SalesOrder = {
    id: string;
    quotationId: string;
    title: string;
    items: SalesOrderItem[];
    totalCost: number;
    status: 'open' | 'in-progress' | 'fulfilled' | 'canceled' | 'invoiced';
    customer: string;
    createdDate: string;
    orderDate: string;
}

// Invoice Types
export type InvoiceItem = SalesOrderItem;

export type Invoice = {
  id: string;
  salesOrderId: string;
  title: string;
  items: InvoiceItem[];
  totalCost: number;
  status: 'draft' | 'sent' | 'paid' | 'void';
  customer: string;
  createdDate: string;
  invoiceDate: string;
  dueDate: string;
};


// Define paths for the new database files
const dbDirectory = path.join(process.cwd(), 'src', 'lib');
const pmDbPath = path.join(dbDirectory, 'project-management.json');
const purchaseDbPath = path.join(dbDirectory, 'purchase.json');
const salesDbPath = path.join(dbDirectory, 'sales.json');
const crmDbPath = path.join(dbDirectory, 'crm.json');
const payrollDbPath = path.join(dbDirectory, 'payroll.json');
const settingsDbPath = path.join(dbDirectory, 'settings.json');
const accountingDbPath = path.join(dbDirectory, 'accounting.json');


// Generic function to read a JSON file
async function readDbFile<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
        await fs.access(filePath);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as T;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            await writeDbFile(filePath, defaultValue);
            return defaultValue;
        }
        throw error;
    }
}

// Generic function to write to a JSON file
async function writeDbFile<T>(filePath: string, data: T): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}


// Project Management Data
type ProjectManagementDb = {
    projects: Project[];
    tasks: Task[];
    issues: Issue[];
    taskBlueprints: TaskBlueprint[];
};

const defaultPmDb: ProjectManagementDb = { projects: [], tasks: [], issues: [], taskBlueprints: [] };

export async function getProjects(): Promise<Project[]>{
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    return data.projects || [];
}

export async function getProjectById(id: string): Promise<Project | undefined> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    return data.projects.find(p => p.id === id);
}

export async function createProject(newProject: Project): Promise<void> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    data.projects.push(newProject);
    await writeDbFile(pmDbPath, data);
}

export async function updateProject(updatedProject: Project): Promise<void> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    const projectIndex = data.projects.findIndex(p => p.id === updatedProject.id);
    if (projectIndex !== -1) {
      data.projects[projectIndex] = updatedProject;
      await writeDbFile(pmDbPath, data);
    } else {
      throw new Error(`Project with id ${updatedProject.id} not found.`);
    }
}

export async function deleteProject(projectId: string): Promise<void> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    const projectIndex = data.projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      data.projects.splice(projectIndex, 1);
      data.tasks = data.tasks.filter(t => t.projectId !== projectId);
      await writeDbFile(pmDbPath, data);
    } else {
      throw new Error(`Project with id ${projectId} not found.`);
    }
}

export async function getTasks(): Promise<Task[]> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    return data.tasks || [];
}

export async function getTaskById(id: string): Promise<Task | undefined> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    return (data.tasks || []).find(t => t.id === id);
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    return (data.tasks || []).filter(t => t.projectId === projectId);
}

export async function createTask(newTask: Task): Promise<void> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    data.tasks.push(newTask);
    await writeDbFile(pmDbPath, data);
}

export async function updateTask(updatedTask: Partial<Task> & { id: string }): Promise<void> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    const taskIndex = data.tasks.findIndex(t => t.id === updatedTask.id);
    if (taskIndex !== -1) {
      data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updatedTask };
      await writeDbFile(pmDbPath, data);
    } else {
      throw new Error(`Task with id ${updatedTask.id} not found.`);
    }
}

export async function deleteTask(taskId: string): Promise<void> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      data.tasks.splice(taskIndex, 1);
      data.issues = data.issues.filter(i => i.taskId !== taskId);
      await writeDbFile(pmDbPath, data);
    } else {
      throw new Error(`Task with id ${taskId} not found.`);
    }
}

export async function getIssues(): Promise<Issue[]> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    return data.issues || [];
}

export async function getIssueById(id: string): Promise<Issue | undefined> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    return (data.issues || []).find(i => i.id === id);
}

export async function getIssuesByTaskId(taskId: string): Promise<Issue[]> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    return (data.issues || []).filter(i => i.taskId === taskId);
}

export async function createIssue(newIssue: Issue): Promise<void> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    data.issues.push(newIssue);
    await writeDbFile(pmDbPath, data);
}

export async function getTaskBlueprints(): Promise<TaskBlueprint[]> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    return data.taskBlueprints || [];
}

export async function createTaskBlueprint(newBlueprint: TaskBlueprint): Promise<void> {
    const data = await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb);
    data.taskBlueprints.push(newBlueprint);
    await writeDbFile(pmDbPath, data);
}

// Purchase Data
type PurchaseDb = {
    products: Product[];
    units: any[];
    productCategories: any[];
    vendors: Vendor[];
};

const defaultPurchaseDb: PurchaseDb = { products: [], units: [], productCategories: [], vendors: [] };

export async function getProducts(): Promise<Product[]> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    return data.products || [];
}

export async function createProduct(newProduct: Product): Promise<void> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    data.products.push(newProduct);
    await writeDbFile(purchaseDbPath, data);
}

export async function getUnits(): Promise<any[]> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    return data.units || [];
}

export async function createUnit(newUnit: any): Promise<void> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    data.units.push(newUnit);
    await writeDbFile(purchaseDbPath, data);
}

export async function updateUnit(originalName: string, updatedUnit: any): Promise<void> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    const unitIndex = data.units.findIndex(u => u.name === originalName);
    if (unitIndex !== -1) {
        data.units[unitIndex] = updatedUnit;
        await writeDbFile(purchaseDbPath, data);
    } else {
        throw new Error(`Unit with name ${originalName} not found.`);
    }
}

export async function deleteUnit(unitName: string): Promise<void> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    const unitIndex = data.units.findIndex(u => u.name === unitName);
    if (unitIndex !== -1) {
        data.units.splice(unitIndex, 1);
        await writeDbFile(purchaseDbPath, data);
    } else {
        throw new Error(`Unit with name ${unitName} not found.`);
    }
}

export async function getProductCategories(): Promise<any[]> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    return data.productCategories || [];
}

export async function createProductCategory(newCategory: any): Promise<void> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    data.productCategories.push(newCategory);
    await writeDbFile(purchaseDbPath, data);
}

export async function updateProductCategory(originalName: string, updatedCategory: any): Promise<void> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    const categoryIndex = data.productCategories.findIndex((c: any) => c.name === originalName);
    if (categoryIndex !== -1) {
        data.productCategories[categoryIndex] = updatedCategory;
        await writeDbFile(purchaseDbPath, data);
    } else {
        throw new Error(`Category with name ${originalName} not found.`);
    }
}

export async function deleteProductCategory(categoryName: string): Promise<void> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    const categoryIndex = data.productCategories.findIndex((c: any) => c.name === categoryName);
    if (categoryIndex !== -1) {
        data.productCategories.splice(categoryIndex, 1);
        await writeDbFile(purchaseDbPath, data);
    } else {
        throw new Error(`Category with name ${categoryName} not found.`);
    }
}

export async function getVendors(): Promise<Vendor[]> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    return data.vendors || [];
}

export async function createVendor(newVendor: Vendor): Promise<void> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    data.vendors.push(newVendor);
    await writeDbFile(purchaseDbPath, data);
}

export async function updateVendor(updatedVendor: Vendor): Promise<void> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    const vendorIndex = data.vendors.findIndex(v => v.id === updatedVendor.id);
    if (vendorIndex !== -1) {
        data.vendors[vendorIndex] = updatedVendor;
        await writeDbFile(purchaseDbPath, data);
    } else {
        throw new Error(`Vendor with id ${updatedVendor.id} not found.`);
    }
}

export async function deleteVendor(vendorId: string): Promise<void> {
    const data = await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb);
    data.vendors = data.vendors.filter(v => v.id !== vendorId);
    await writeDbFile(purchaseDbPath, data);
}

// Settings Data
type SettingsDb = {
    appSettings: AppSettings;
    currencies: Currency[];
    companyProfile: CompanyProfile;
    users: User[];
    userRoles: UserRole[];
};

const defaultSettingsDb: SettingsDb = { 
    appSettings: {
        currency: 'USD',
        dashboard: {
            showFinancialStats: true,
            showRevenueChart: true,
            showSalesAnalysis: true,
            showProjectManagementStats: true,
            showCrmStats: true,
            showPurchaseStats: true,
        },
        enabled_modules: {
            project_management: true,
            purchase: true,
            crm: true,
            payroll: true,
            user_management: true,
            sales: true,
            accounting: true,
        },
        quotationSettings: {
            termsAndConditions: "1. Payment to be made within 30 days of the invoice date.\\n2. Any additional work not mentioned in this quotation will be charged separately.\\n3. This quotation is valid for 15 days from the date of issue.",
            bankName: "Default Bank",
            accountNumber: "0000-0000-0000-0000",
            iban: "AE000000000000000000000",
            taxPercentage: 5,
            sendingEmail: "noreply@example.com",
            receivingEmail: "sales@example.com",
        }
    }, 
    currencies: [], 
    companyProfile: {
        companyName: "",
        trnNumber: "",
        logoUrl: "",
        address: "",
        bankName: "",
        accountNumber: "",
        iban: ""
    }, 
    users: [], 
    userRoles: [] 
};

export async function getCurrencies(): Promise<Currency[]> {
    const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
    return data.currencies || [];
}

export async function createCurrency(newCurrency: Currency): Promise<void> {
    const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
    data.currencies.push(newCurrency);
    await writeDbFile(settingsDbPath, data);
}

export async function updateCurrency(originalCode: string, updatedCurrency: Currency): Promise<void> {
    const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
    const currencyIndex = data.currencies.findIndex(c => c.code === originalCode);
    if (currencyIndex !== -1) {
        data.currencies[currencyIndex] = updatedCurrency;
        await writeDbFile(settingsDbPath, data);
    } else {
        throw new Error(`Currency with code ${originalCode} not found.`);
    }
}

export async function deleteCurrency(currencyCode: string): Promise<void> {
    const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
    const currencyIndex = data.currencies.findIndex(c => c.code === currencyCode);
    if (currencyIndex !== -1) {
        data.currencies.splice(currencyIndex, 1);
        await writeDbFile(settingsDbPath, data);
    } else {
        throw new Error(`Currency with code ${currencyCode} not found.`);
    }
}

export async function getAppSettings(): Promise<AppSettings> {
    const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
    return { 
        ...defaultSettingsDb.appSettings, 
        ...data.appSettings, 
        enabled_modules: { ...defaultSettingsDb.appSettings.enabled_modules, ...data.appSettings?.enabled_modules },
        quotationSettings: { ...defaultSettingsDb.appSettings.quotationSettings, ...data.appSettings?.quotationSettings }
    };
}

export async function updateAppSettings(newSettings: Partial<AppSettings>): Promise<{ message: string; }> {
    try {
        const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
        data.appSettings = { ...data.appSettings, ...newSettings };
        await writeDbFile(settingsDbPath, data);
        return { message: 'Settings updated successfully.' };
    } catch (error) {
        console.error('Database error:', error);
        return { message: 'Failed to update settings.' };
    }
}

export async function getCompanyProfile(): Promise<CompanyProfile> {
  const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
  return data.companyProfile || defaultSettingsDb.companyProfile;
}

export async function updateCompanyProfile(newProfileData: Partial<CompanyProfile>): Promise<void> {
    const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
    data.companyProfile = { ...(data.companyProfile || {}), ...newProfileData };
    await writeDbFile(settingsDbPath, data);
}

export async function getUsers(): Promise<User[]> {
  const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
  return data.users || [];
}

export async function createUser(newUser: User): Promise<void> {
  const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
  data.users.push(newUser);
  await writeDbFile(settingsDbPath, data);
}

export async function updateUser(updatedUser: User): Promise<void> {
  const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
  const userIndex = data.users.findIndex(u => u.id === updatedUser.id);
  if (userIndex !== -1) {
    data.users[userIndex] = updatedUser;
    await writeDbFile(settingsDbPath, data);
  } else {
    throw new Error(`User with id ${updatedUser.id} not found.`);
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
  data.users = data.users.filter(u => u.id !== userId);
  await writeDbFile(settingsDbPath, data);
}

export async function getUserRoles(): Promise<UserRole[]> {
    const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
    return data.userRoles || [];
}

export async function updateUserRole(updatedRole: Omit<UserRole, 'id'> & { id: string }): Promise<void> {
  const data = await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb);
  const roleIndex = data.userRoles.findIndex(r => r.id === updatedRole.id);
  if (roleIndex !== -1) {
    data.userRoles[roleIndex] = { ...data.userRoles[roleIndex], ...updatedRole };
    await writeDbFile(settingsDbPath, data);
  } else {
    throw new Error(`Role with id ${updatedRole.id} not found.`);
  }
}

// Payroll Data
type PayrollDb = {
    employees: Employee[];
    positions: Position[];
};

const defaultPayrollDb: PayrollDb = { employees: [], positions: [] };

export async function getEmployees(): Promise<Employee[]> {
  const data = await readDbFile<PayrollDb>(payrollDbPath, defaultPayrollDb);
  return data.employees || [];
}

export async function getPositions(): Promise<Position[]> {
  const data = await readDbFile<PayrollDb>(payrollDbPath, defaultPayrollDb);
  return data.positions || [];
}

// CRM Data
type CrmDb = {
    customers: Customer[];
};

const defaultCrmDb: CrmDb = { customers: [] };

export async function getCustomers(): Promise<Customer[]> {
    const data = await readDbFile<CrmDb>(crmDbPath, defaultCrmDb);
    return data.customers || [];
}

export async function createCustomer(newCustomer: Customer): Promise<void> {
    const data = await readDbFile<CrmDb>(crmDbPath, defaultCrmDb);
    data.customers.push(newCustomer);
    await writeDbFile(crmDbPath, data);
}

export async function updateCustomer(updatedCustomer: Customer): Promise<void> {
    const data = await readDbFile<CrmDb>(crmDbPath, defaultCrmDb);
    const customerIndex = data.customers.findIndex(c => c.id === updatedCustomer.id);
    if (customerIndex !== -1) {
        data.customers[customerIndex] = updatedCustomer;
        await writeDbFile(crmDbPath, data);
    } else {
        throw new Error(`Customer with id ${updatedCustomer.id} not found.`);
    }
}

export async function deleteCustomer(customerId: string): Promise<void> {
    const data = await readDbFile<CrmDb>(crmDbPath, defaultCrmDb);
    data.customers = data.customers.filter(c => c.id !== customerId);
    await writeDbFile(crmDbPath, data);
}

// Sales Data
type SalesDb = {
    estimations: Estimation[];
    quotations: Quotation[];
    salesOrders: SalesOrder[];
    invoices: Invoice[];
};

const defaultSalesDb: SalesDb = { estimations: [], quotations: [], salesOrders: [], invoices: [] };

export async function getEstimations(): Promise<Estimation[]> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    return data.estimations || [];
}

export async function getEstimationById(id: string): Promise<Estimation | undefined> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    return (data.estimations || []).find(e => e.id === id);
}

export async function createEstimation(newEstimation: Estimation): Promise<void> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    data.estimations.push(newEstimation);
    await writeDbFile(salesDbPath, data);
}

export async function updateDbEstimation(updatedEstimation: Estimation): Promise<void> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    const estimationIndex = data.estimations.findIndex(e => e.id === updatedEstimation.id);
    if (estimationIndex !== -1) {
        data.estimations[estimationIndex] = updatedEstimation;
        await writeDbFile(salesDbPath, data);
    } else {
        throw new Error(`Estimation with id ${updatedEstimation.id} not found.`);
    }
}

export async function deleteEstimation(estimationId: string): Promise<void> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    const estimationIndex = data.estimations.findIndex(e => e.id === estimationId);
    if (estimationIndex !== -1) {
        data.estimations.splice(estimationIndex, 1);
        await writeDbFile(salesDbPath, data);
    } else {
        throw new Error(`Estimation with id ${estimationId} not found.`);
    }
}

export async function getQuotations(): Promise<Quotation[]> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    return data.quotations || [];
}

export async function getQuotationById(id: string): Promise<Quotation | undefined> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    return (data.quotations || []).find(q => q.id === id);
}

export async function createQuotation(newQuotation: Quotation): Promise<void> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    data.quotations.push(newQuotation);
    await writeDbFile(salesDbPath, data);
}

export async function updateQuotation(updatedQuotation: Quotation): Promise<void> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    const quotationIndex = data.quotations.findIndex(q => q.id === updatedQuotation.id);
    if (quotationIndex !== -1) {
        data.quotations[quotationIndex] = updatedQuotation;
        await writeDbFile(salesDbPath, data);
    } else {
        throw new Error(`Quotation with id ${updatedQuotation.id} not found.`);
    }
}

export async function getSalesOrders(): Promise<SalesOrder[]> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    return data.salesOrders || [];
}

export async function getSalesOrderById(id: string): Promise<SalesOrder | undefined> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    return (data.salesOrders || []).find(so => so.id === id);
}

export async function createSalesOrder(newSalesOrder: SalesOrder): Promise<void> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    data.salesOrders.push(newSalesOrder);
    await writeDbFile(salesDbPath, data);
}

export async function updateSalesOrder(updatedSalesOrder: SalesOrder): Promise<void> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    const orderIndex = data.salesOrders.findIndex(so => so.id === updatedSalesOrder.id);
    if (orderIndex !== -1) {
        data.salesOrders[orderIndex] = updatedSalesOrder;
        await writeDbFile(salesDbPath, data);
    } else {
        throw new Error(`Sales Order with id ${updatedSalesOrder.id} not found.`);
    }
}

export async function getInvoices(): Promise<Invoice[]> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    return data.invoices || [];
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    return (data.invoices || []).find(inv => inv.id === id);
}

export async function createInvoice(newInvoice: Invoice): Promise<void> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    data.invoices.push(newInvoice);
    await writeDbFile(salesDbPath, data);
}

export async function updateInvoice(updatedInvoice: Invoice): Promise<void> {
    const data = await readDbFile<SalesDb>(salesDbPath, defaultSalesDb);
    const invoiceIndex = data.invoices.findIndex(inv => inv.id === updatedInvoice.id);
    if (invoiceIndex !== -1) {
        data.invoices[invoiceIndex] = updatedInvoice;
        await writeDbFile(salesDbPath, data);
    } else {
        throw new Error(`Invoice with id ${updatedInvoice.id} not found.`);
    }
}

// Accounting Data
type AccountingDb = {
    accounts: Account[];
    journals: Journal[];
};

const defaultAccountingDb: AccountingDb = { accounts: [], journals: [] };

export async function getAccounts(): Promise<Account[]> {
    const data = await readDbFile<AccountingDb>(accountingDbPath, defaultAccountingDb);
    return data.accounts || [];
}

export async function createAccount(newAccount: Account): Promise<void> {
    const data = await readDbFile<AccountingDb>(accountingDbPath, defaultAccountingDb);
    data.accounts.push(newAccount);
    await writeDbFile(accountingDbPath, data);
}

export async function updateAccountBalance(accountId: string, newBalance: number): Promise<void> {
    const data = await readDbFile<AccountingDb>(accountingDbPath, defaultAccountingDb);
    const accountIndex = data.accounts.findIndex(a => a.id === accountId);
    if (accountIndex !== -1) {
        data.accounts[accountIndex].balance = newBalance;
        await writeDbFile(accountingDbPath, data);
    } else {
        throw new Error(`Account with id ${accountId} not found.`);
    }
}

export async function getJournals(): Promise<Journal[]> {
    const data = await readDbFile<AccountingDb>(accountingDbPath, defaultAccountingDb);
    return data.journals || [];
}

export async function createJournal(newJournal: Journal): Promise<void> {
    const data = await readDbFile<AccountingDb>(accountingDbPath, defaultAccountingDb);
    data.journals.push(newJournal);
    await writeDbFile(accountingDbPath, data);
}


// Backup and Restore
type FullBackup = {
  settings: SettingsDb;
  projectManagement: ProjectManagementDb;
  purchase: PurchaseDb;
  sales: SalesDb;
  crm: CrmDb;
  payroll: PayrollDb;
  accounting: AccountingDb;
};

export async function getDbJsonContent(): Promise<{ content: string | null; error?: string }> {
  try {
    const backupData: FullBackup = {
        settings: await readDbFile<SettingsDb>(settingsDbPath, defaultSettingsDb),
        projectManagement: await readDbFile<ProjectManagementDb>(pmDbPath, defaultPmDb),
        purchase: await readDbFile<PurchaseDb>(purchaseDbPath, defaultPurchaseDb),
        sales: await readDbFile<SalesDb>(salesDbPath, defaultSalesDb),
        crm: await readDbFile<CrmDb>(crmDbPath, defaultCrmDb),
        payroll: await readDbFile<PayrollDb>(payrollDbPath, defaultPayrollDb),
        accounting: await readDbFile<AccountingDb>(accountingDbPath, defaultAccountingDb),
    };
    return { content: JSON.stringify(backupData, null, 2) };
  } catch (error) {
    console.error('Database read error:', error);
    return { content: null, error: 'Failed to read all database files.' };
  }
}

export async function restoreDbFromJsonContent(content: string): Promise<{ success: boolean; error?: string }> {
  try {
    const backupData = JSON.parse(content) as FullBackup;

    const requiredModules: (keyof FullBackup)[] = ['settings', 'projectManagement', 'purchase', 'sales', 'crm', 'payroll', 'accounting'];
    for (const module of requiredModules) {
        if (!backupData[module]) {
            throw new Error(`Invalid backup file structure. Module "${module}" is missing.`);
        }
    }

    // Write each module's data to its respective file
    await writeDbFile(settingsDbPath, backupData.settings);
    await writeDbFile(pmDbPath, backupData.projectManagement);
    await writeDbFile(purchaseDbPath, backupData.purchase);
    await writeDbFile(salesDbPath, backupData.sales);
    await writeDbFile(crmDbPath, backupData.crm);
    await writeDbFile(payrollDbPath, backupData.payroll);
    await writeDbFile(accountingDbPath, backupData.accounting);

    return { success: true };
  } catch (error: any) {
    console.error('Database restore error:', error);
    if (error instanceof SyntaxError) {
      return { success: false, error: 'Invalid JSON file format.' };
    }
    return { success: false, error: `Failed to restore database: ${error.message}` };
  }
}
