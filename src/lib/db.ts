

'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Project } from '@/components/project-management/projects-list';
import type { Task } from '@/components/project-management/tasks-list';
import type { Issue } from '@/components/project-management/issues-list';
import type { TaskBlueprint } from '@/components/project-management/task-blueprints-list';
import type { Product } from '@/components/purchase/products-list';
import type { Currency } from '@/components/settings/currency-management';
import type { Estimation } from './estimations-list';
import type { Quotation } from '@/components/sales/quotations-list';

const dbPath = path.join(process.cwd(), 'src', 'lib', 'db.json');

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
}

export type QuotationSettings = {
  termsAndConditions: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  taxPercentage: number;
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
    id: string; // Corresponds to the EstimationTask ID
    title: string;
    description?: string;
    quantity: number;
    rate: number; // Corresponds to the EstimationTask totalCost
    imageUrl?: string;
};

type DbData = {
  projects: Project[];
  tasks: Task[];
  issues: Issue[];
  taskBlueprints: TaskBlueprint[];
  products: Product[];
  units: any[];
  productCategories: any[];
  currencies: Currency[];
  appSettings: AppSettings;
  employees: Employee[];
  positions: Position[];
  companyProfile: CompanyProfile;
  users: User[];
  userRoles: UserRole[];
  estimations: Estimation[];
  quotations: Quotation[];
};

async function readDb(): Promise<DbData> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data) as DbData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If the file doesn't exist, return a default structure
      return { 
          projects: [], 
          tasks: [], 
          issues: [], 
          taskBlueprints: [], 
          products: [], 
          units: [],
          productCategories: [],
          currencies: [],
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
            },
            quotationSettings: {
                termsAndConditions: "1. Payment to be made within 30 days of the invoice date.\n2. Any additional work not mentioned in this quotation will be charged separately.\n3. This quotation is valid for 15 days from the date of issue.",
                bankName: "Default Bank",
                accountNumber: "0000-0000-0000-0000",
                iban: "AE000000000000000000000",
                taxPercentage: 5
            }
          },
          employees: [],
          positions: [],
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
          userRoles: [],
          estimations: [],
          quotations: [],
      };
    }
    throw error;
  }
}

async function writeDb(data: DbData): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getProjects(): Promise<Project[]>{
    const data = await readDb();
    return data.projects || [];
}

export async function getProjectById(id: string): Promise<Project | undefined> {
    const data = await readDb();
    return data.projects.find(p => p.id === id);
}

export async function createProject(newProject: Project): Promise<void> {
    const data = await readDb();
    data.projects.push(newProject);
    await writeDb(data);
}

export async function updateProject(updatedProject: Project): Promise<void> {
    const data = await readDb();
    const projectIndex = data.projects.findIndex(p => p.id === updatedProject.id);
    if (projectIndex !== -1) {
      data.projects[projectIndex] = updatedProject;
      await writeDb(data);
    } else {
      throw new Error(`Project with id ${updatedProject.id} not found.`);
    }
}

export async function deleteProject(projectId: string): Promise<void> {
    const data = await readDb();
    const projectIndex = data.projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      data.projects.splice(projectIndex, 1);
      // Optional: also delete tasks associated with this project
      data.tasks = data.tasks.filter(t => t.projectId !== projectId);
      await writeDb(data);
    } else {
      throw new Error(`Project with id ${projectId} not found.`);
    }
}

export async function getTasks(): Promise<Task[]> {
    const data = await readDb();
    return data.tasks || [];
}

export async function getTaskById(id: string): Promise<Task | undefined> {
    const data = await readDb();
    return (data.tasks || []).find(t => t.id === id);
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
    const data = await readDb();
    return (data.tasks || []).filter(t => t.projectId === projectId);
}

export async function createTask(newTask: Task): Promise<void> {
    const data = await readDb();
    if (!data.tasks) {
        data.tasks = [];
    }
    data.tasks.push(newTask);
    await writeDb(data);
}

export async function updateTask(updatedTask: Partial<Task> & { id: string }): Promise<void> {
    const data = await readDb();
    const taskIndex = data.tasks.findIndex(t => t.id === updatedTask.id);
    if (taskIndex !== -1) {
      data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updatedTask };
      await writeDb(data);
    } else {
      throw new Error(`Task with id ${updatedTask.id} not found.`);
    }
}

export async function deleteTask(taskId: string): Promise<void> {
    const data = await readDb();
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      data.tasks.splice(taskIndex, 1);
      // Optional: also delete issues associated with this task
      data.issues = data.issues.filter(i => i.taskId !== taskId);
      await writeDb(data);
    } else {
      throw new Error(`Task with id ${taskId} not found.`);
    }
}

export async function getIssues(): Promise<Issue[]> {
    const data = await readDb();
    return data.issues || [];
}

export async function getIssueById(id: string): Promise<Issue | undefined> {
    const data = await readDb();
    return (data.issues || []).find(i => i.id === id);
}

export async function getIssuesByTaskId(taskId: string): Promise<Issue[]> {
    const data = await readDb();
    return (data.issues || []).filter(i => i.taskId === taskId);
}

export async function createIssue(newIssue: Issue): Promise<void> {
    const data = await readDb();
    if (!data.issues) {
      data.issues = [];
    }
    data.issues.push(newIssue);
    await writeDb(data);
}

export async function getTaskBlueprints(): Promise<TaskBlueprint[]> {
    const data = await readDb();
    return data.taskBlueprints || [];
}

export async function createTaskBlueprint(newBlueprint: TaskBlueprint): Promise<void> {
    const data = await readDb();
    if (!data.taskBlueprints) {
      data.taskBlueprints = [];
    }
    data.taskBlueprints.push(newBlueprint);
    await writeDb(data);
}

export async function getProducts(): Promise<Product[]> {
    const data = await readDb();
    return data.products || [];
}

export async function createProduct(newProduct: Product): Promise<void> {
    const data = await readDb();
    if (!data.products) {
      data.products = [];
    }
    data.products.push(newProduct);
    await writeDb(data);
}

export async function getUnits(): Promise<any[]> {
    const data = await readDb();
    return data.units || [];
}

export async function createUnit(newUnit: any): Promise<void> {
    const data = await readDb();
    if (!data.units) {
        data.units = [];
    }
    data.units.push(newUnit);
    await writeDb(data);
}

export async function updateUnit(originalName: string, updatedUnit: any): Promise<void> {
    const data = await readDb();
    const unitIndex = data.units.findIndex(u => u.name === originalName);
    if (unitIndex !== -1) {
        data.units[unitIndex] = updatedUnit;
        await writeDb(data);
    } else {
        throw new Error(`Unit with name ${originalName} not found.`);
    }
}

export async function deleteUnit(unitName: string): Promise<void> {
    const data = await readDb();
    const unitIndex = data.units.findIndex(u => u.name === unitName);
    if (unitIndex !== -1) {
        data.units.splice(unitIndex, 1);
        await writeDb(data);
    } else {
        throw new Error(`Unit with name ${unitName} not found.`);
    }
}

export async function getProductCategories(): Promise<any[]> {
    const data = await readDb();
    return (data as any).productCategories || [];
}

export async function createProductCategory(newCategory: any): Promise<void> {
    const data = await readDb() as any;
    if (!data.productCategories) {
        data.productCategories = [];
    }
    data.productCategories.push(newCategory);
    await writeDb(data);
}

export async function updateProductCategory(originalName: string, updatedCategory: any): Promise<void> {
    const data = await readDb() as any;
    const categoryIndex = data.productCategories.findIndex((c: any) => c.name === originalName);
    if (categoryIndex !== -1) {
        data.productCategories[categoryIndex] = updatedCategory;
        await writeDb(data);
    } else {
        throw new Error(`Category with name ${originalName} not found.`);
    }
}

export async function deleteProductCategory(categoryName: string): Promise<void> {
    const data = await readDb() as any;
    const categoryIndex = data.productCategories.findIndex((c: any) => c.name === categoryName);
    if (categoryIndex !== -1) {
        data.productCategories.splice(categoryIndex, 1);
        await writeDb(data);
    } else {
        throw new Error(`Category with name ${categoryName} not found.`);
    }
}


export async function getCurrencies(): Promise<Currency[]> {
    const data = await readDb();
    return data.currencies || [];
}

export async function createCurrency(newCurrency: Currency): Promise<void> {
    const data = await readDb();
    if (!data.currencies) {
        data.currencies = [];
    }
    data.currencies.push(newCurrency);
    await writeDb(data);
}

export async function updateCurrency(originalCode: string, updatedCurrency: Currency): Promise<void> {
    const data = await readDb();
    const currencyIndex = data.currencies.findIndex(c => c.code === originalCode);
    if (currencyIndex !== -1) {
        data.currencies[currencyIndex] = updatedCurrency;
        await writeDb(data);
    } else {
        throw new Error(`Currency with code ${originalCode} not found.`);
    }
}

export async function deleteCurrency(currencyCode: string): Promise<void> {
    const data = await readDb();
    const currencyIndex = data.currencies.findIndex(c => c.code === currencyCode);
    if (currencyIndex !== -1) {
        data.currencies.splice(currencyIndex, 1);
        await writeDb(data);
    } else {
        throw new Error(`Currency with code ${currencyCode} not found.`);
    }
}

export async function getAppSettings(): Promise<AppSettings> {
    const data = await readDb();
    const defaultSettings: AppSettings = {
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
        },
        quotationSettings: {
            termsAndConditions: "1. Payment to be made within 30 days of the invoice date.\n2. Any additional work not mentioned in this quotation will be charged separately.\n3. This quotation is valid for 15 days from the date of issue.",
            bankName: "Default Bank",
            accountNumber: "0000-0000-0000-0000",
            iban: "AE000000000000000000000",
            taxPercentage: 5
        }
    };
    return { 
        ...defaultSettings, 
        ...data.appSettings, 
        enabled_modules: { ...defaultSettings.enabled_modules, ...data.appSettings?.enabled_modules },
        quotationSettings: { ...defaultSettings.quotationSettings, ...data.appSettings?.quotationSettings }
    };
}

export async function updateAppSettings(newSettings: Partial<AppSettings>): Promise<{ message: string; }> {
    try {
        const data = await readDb();
        data.appSettings = { ...data.appSettings, ...newSettings };
        await writeDb(data);
        return { message: 'Settings updated successfully.' };
    } catch (error) {
        console.error('Database error:', error);
        return { message: 'Failed to update settings.' };
    }
}


// Payroll functions
export async function getEmployees(): Promise<Employee[]> {
  const data = await readDb();
  return data.employees || [];
}

export async function getPositions(): Promise<Position[]> {
  const data = await readDb();
  return data.positions || [];
}

// Company Profile functions
export async function getCompanyProfile(): Promise<CompanyProfile> {
  const data = await readDb();
  return data.companyProfile || {
    companyName: "",
    trnNumber: "",
    logoUrl: "",
    address: "",
    bankName: "",
    accountNumber: "",
    iban: ""
  };
}

export async function updateCompanyProfile(newProfileData: Partial<CompanyProfile>): Promise<void> {
    const data = await readDb();
    data.companyProfile = { ...(data.companyProfile || {}), ...newProfileData };
    await writeDb(data);
}

// User Management functions
export async function getUsers(): Promise<User[]> {
  const data = await readDb();
  return data.users || [];
}

export async function createUser(newUser: User): Promise<void> {
  const data = await readDb();
  if (!data.users) {
    data.users = [];
  }
  data.users.push(newUser);
  await writeDb(data);
}

export async function updateUser(updatedUser: User): Promise<void> {
  const data = await readDb();
  const userIndex = data.users.findIndex(u => u.id === updatedUser.id);
  if (userIndex !== -1) {
    data.users[userIndex] = updatedUser;
    await writeDb(data);
  } else {
    throw new Error(`User with id ${updatedUser.id} not found.`);
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const data = await readDb();
  const userIndex = data.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    data.users.splice(userIndex, 1);
    await writeDb(data);
  } else {
    throw new Error(`User with id ${userId} not found.`);
  }
}

export async function getUserRoles(): Promise<UserRole[]> {
    const data = await readDb();
    return data.userRoles || [];
}

export async function updateUserRole(updatedRole: Omit<UserRole, 'id'> & { id: string }): Promise<void> {
  const data = await readDb();
  const roleIndex = data.userRoles.findIndex(r => r.id === updatedRole.id);
  if (roleIndex !== -1) {
    data.userRoles[roleIndex] = { ...data.userRoles[roleIndex], ...updatedRole };
    await writeDb(data);
  } else {
    throw new Error(`Role with id ${updatedRole.id} not found.`);
  }
}

// Estimations Functions
export async function getEstimations(): Promise<Estimation[]> {
    const data = await readDb();
    return data.estimations || [];
}

export async function getEstimationById(id: string): Promise<Estimation | undefined> {
    const data = await readDb();
    return (data.estimations || []).find(e => e.id === id);
}

export async function createEstimation(newEstimation: Estimation): Promise<void> {
    const data = await readDb();
    if (!data.estimations) {
        data.estimations = [];
    }
    data.estimations.push(newEstimation);
    await writeDb(data);
}

export async function updateEstimation(updatedEstimation: Estimation): Promise<void> {
    const data = await readDb();
    const estimationIndex = data.estimations.findIndex(e => e.id === updatedEstimation.id);
    if (estimationIndex !== -1) {
        data.estimations[estimationIndex] = updatedEstimation;
        await writeDb(data);
    } else {
        throw new Error(`Estimation with id ${updatedEstimation.id} not found.`);
    }
}

export async function deleteEstimation(estimationId: string): Promise<void> {
    const data = await readDb();
    const estimationIndex = data.estimations.findIndex(e => e.id === estimationId);
    if (estimationIndex !== -1) {
        data.estimations.splice(estimationIndex, 1);
        await writeDb(data);
    } else {
        throw new Error(`Estimation with id ${estimationId} not found.`);
    }
}

// Quotations Functions
export async function getQuotations(): Promise<Quotation[]> {
    const data = await readDb();
    return data.quotations || [];
}

export async function getQuotationById(id: string): Promise<Quotation | undefined> {
    const data = await readDb();
    return (data.quotations || []).find(q => q.id === id);
}

export async function createQuotation(newQuotation: Quotation): Promise<void> {
    const data = await readDb();
    if (!data.quotations) {
        data.quotations = [];
    }
    data.quotations.push(newQuotation);
    await writeDb(data);
}

export async function updateQuotation(updatedQuotation: Quotation): Promise<void> {
    const data = await readDb();
    const quotationIndex = data.quotations.findIndex(q => q.id === updatedQuotation.id);
    if (quotationIndex !== -1) {
        data.quotations[quotationIndex] = updatedQuotation;
        await writeDb(data);
    } else {
        throw new Error(`Quotation with id ${updatedQuotation.id} not found.`);
    }
}
