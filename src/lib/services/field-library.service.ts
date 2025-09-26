/**
 * Field Library Service - Frontend service for managing field library data
 */

export interface FieldLibraryItem {
    id: string;
    fieldId: string;
    name: string;
    category: string;
    type: string;
    responseType: string;
    description?: string;
    icon?: string;
    validationOptions?: any;
    configurationOptions?: any;
    defaultValue?: any;
    isRequired?: boolean;
    dependencies?: any[];
    useCases?: string[];
    accessibility?: any;
    htmlType?: string;
    component?: string;
    schema?: any;
    logic?: any;
    sequence?: number;
    isActive?: boolean;
    tags?: string[];
    version?: string;
}

export interface FieldLibraryCategory {
    name: string;
    displayName: string;
    description: string;
    icon: string;
    fieldCount: number;
    fields: FieldLibraryItem[];
}

export interface FieldLibraryTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    fields: FieldLibraryItem[];
    version: string;
    tags: string[];
    isPublic: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export class FieldLibraryService {
    private static instance: FieldLibraryService;
    private baseUrl = '/api/v1/field-library';
    private cache: Map<string, any> = new Map();
    private cacheTimeout = 5 * 60 * 1000; // 5 minutes

    private constructor() {}

    public static getInstance(): FieldLibraryService {
        if (!FieldLibraryService.instance) {
            FieldLibraryService.instance = new FieldLibraryService();
        }
        return FieldLibraryService.instance;
    }

    /**
     * Get all field library categories
     */
    async getCategories(): Promise<FieldLibraryCategory[]> {
        const cacheKey = 'categories';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${this.baseUrl}/categories`);
            const data = await response.json();
            
            if (data.HttpCode === 200) {
                const categories = this.transformCategories(data.Data);
                this.setCachedData(cacheKey, categories);
                return categories;
            }
            throw new Error(data.Message || 'Failed to fetch categories');
        } catch (error) {
            console.error('Error fetching field library categories:', error);
            return this.getDefaultCategories();
        }
    }

    /**
     * Get fields by category
     */
    async getFieldsByCategory(category: string): Promise<FieldLibraryItem[]> {
        const cacheKey = `category-${category}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${this.baseUrl}/category/${encodeURIComponent(category)}`);
            const data = await response.json();
            
            if (data.HttpCode === 200) {
                const fields = this.transformFields(data.Data);
                this.setCachedData(cacheKey, fields);
                return fields;
            }
            throw new Error(data.Message || 'Failed to fetch fields by category');
        } catch (error) {
            console.error(`Error fetching fields for category ${category}:`, error);
            return [];
        }
    }

    /**
     * Search field library
     */
    async searchFields(query: string, category?: string): Promise<FieldLibraryItem[]> {
        try {
            const params = new URLSearchParams({ query });
            if (category) params.append('category', category);
            
            const response = await fetch(`${this.baseUrl}/search?${params}`);
            const data = await response.json();
            
            if (data.HttpCode === 200) {
                return this.transformFields(data.Data);
            }
            throw new Error(data.Message || 'Failed to search fields');
        } catch (error) {
            console.error('Error searching field library:', error);
            return [];
        }
    }

    /**
     * Get field library statistics
     */
    async getStatistics(): Promise<any> {
        const cacheKey = 'statistics';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${this.baseUrl}/statistics`);
            const data = await response.json();
            
            if (data.HttpCode === 200) {
                this.setCachedData(cacheKey, data.Data);
                return data.Data;
            }
            throw new Error(data.Message || 'Failed to fetch statistics');
        } catch (error) {
            console.error('Error fetching field library statistics:', error);
            return {};
        }
    }

    /**
     * Get all field templates
     */
    async getTemplates(): Promise<FieldLibraryTemplate[]> {
        const cacheKey = 'templates';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${this.baseUrl}/template`);
            const data = await response.json();
            
            if (data.HttpCode === 200) {
                this.setCachedData(cacheKey, data.Data);
                return data.Data;
            }
            throw new Error(data.Message || 'Failed to fetch templates');
        } catch (error) {
            console.error('Error fetching field templates:', error);
            return [];
        }
    }

    /**
     * Create a new field template
     */
    async createTemplate(template: Omit<FieldLibraryTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<FieldLibraryTemplate> {
        try {
            const response = await fetch(`${this.baseUrl}/template`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(template),
            });
            const data = await response.json();
            
            if (data.HttpCode === 201) {
                this.clearCache();
                return data.Data;
            }
            throw new Error(data.Message || 'Failed to create template');
        } catch (error) {
            console.error('Error creating field template:', error);
            throw error;
        }
    }

    /**
     * Export field template set
     */
    async exportTemplate(templateId: string): Promise<Blob> {
        try {
            const response = await fetch(`${this.baseUrl}/template/${templateId}/export`);
            if (!response.ok) throw new Error('Failed to export template');
            return response.blob();
        } catch (error) {
            console.error('Error exporting template:', error);
            throw error;
        }
    }

    /**
     * Import field template set
     */
    async importTemplate(file: File): Promise<FieldLibraryTemplate> {
        try {
            // Read the file content
            const text = await file.text();
            const templateData = JSON.parse(text);
            
            const response = await fetch(`${this.baseUrl}/template/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ templateData }),
            });
            const data = await response.json();
            
            if (data.HttpCode === 201) {
                this.clearCache();
                return data.Data;
            }
            throw new Error(data.Message || 'Failed to import template');
        } catch (error) {
            console.error('Error importing template:', error);
            throw error;
        }
    }

    /**
     * Transform backend categories to frontend format
     */
    private transformCategories(data: any[]): FieldLibraryCategory[] {
        const categoryMap = new Map<string, FieldLibraryCategory>();
        
        data.forEach((item: any) => {
            const categoryName = item.Category || 'uncategorized';
            
            if (!categoryMap.has(categoryName)) {
                categoryMap.set(categoryName, {
                    name: categoryName,
                    displayName: this.formatCategoryName(categoryName),
                    description: this.getCategoryDescription(categoryName),
                    icon: this.getCategoryIcon(categoryName),
                    fieldCount: 0,
                    fields: []
                });
            }
            
            const category = categoryMap.get(categoryName)!;
            category.fields.push(this.transformField(item));
            category.fieldCount++;
        });
        
        return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Transform backend fields to frontend format
     */
    private transformFields(data: any[]): FieldLibraryItem[] {
        return data.map(item => this.transformField(item));
    }

    /**
     * Transform single field
     */
    private transformField(item: any): FieldLibraryItem {
        return {
            id: item.Id || item.id,
            fieldId: item.FieldId || item.fieldId,
            name: item.Name || item.name,
            category: item.Category || item.category,
            type: item.Type || item.type,
            responseType: item.ResponseType || item.responseType,
            description: item.Description || item.description,
            icon: item.Icon || item.icon,
            validationOptions: item.ValidationOptions || item.validationOptions,
            configurationOptions: item.ConfigurationOptions || item.configurationOptions,
            defaultValue: item.DefaultValue || item.defaultValue,
            isRequired: item.IsRequired || item.isRequired,
            dependencies: item.Dependencies || item.dependencies,
            useCases: item.UseCases || item.useCases,
            accessibility: item.Accessibility || item.accessibility,
            htmlType: item.HtmlType || item.htmlType,
            component: item.Component || item.component,
            schema: item.Schema || item.schema,
            logic: item.Logic || item.logic,
            sequence: item.Sequence || item.sequence,
            isActive: item.IsActive !== undefined ? item.IsActive : item.isActive,
            tags: item.Tags || item.tags,
            version: item.Version || item.version
        };
    }

    /**
     * Format category name for display
     */
    private formatCategoryName(category: string): string {
        return category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get category description
     */
    private getCategoryDescription(category: string): string {
        const descriptions: Record<string, string> = {
            'text-based': 'Text input fields for various text-based data collection',
            'numeric': 'Numeric fields for numbers, currency, and mathematical values',
            'selection-choice': 'Selection fields for single and multiple choice options',
            'date-time': 'Date and time picker fields with various formats',
            'rating-feedback': 'Rating and feedback collection fields',
            'measurement': 'Measurement fields for physical quantities',
            'geographic': 'Location and address-related fields',
            'media-file': 'File upload and media-related fields',
            'healthcare': 'Specialized healthcare and medical fields',
            'business-professional': 'Business and professional form fields',
            'educational': 'Educational and academic form fields',
            'e-commerce': 'E-commerce and shopping-related fields',
            'survey-research': 'Survey and research data collection fields',
            'interactive-advanced': 'Advanced interactive and dynamic fields'
        };
        return descriptions[category] || 'Various form fields for data collection';
    }

    /**
     * Get category icon
     */
    private getCategoryIcon(category: string): string {
        const icons: Record<string, string> = {
            'text-based': 'fluent:text-12-regular',
            'numeric': 'carbon:string-integer',
            'selection-choice': 'mdi:checkbox-outline',
            'date-time': 'uiw:date',
            'rating-feedback': 'ri:star-line',
            'measurement': 'material-symbols:straighten-outline',
            'geographic': 'pajamas:location',
            'media-file': 'ph:file-duotone',
            'healthcare': 'healthicons:medical-kit',
            'business-professional': 'material-symbols:business-center-outline',
            'educational': 'material-symbols:school-outline',
            'e-commerce': 'material-symbols:shopping-cart-outline',
            'survey-research': 'material-symbols:poll-outline',
            'interactive-advanced': 'material-symbols:settings-outline'
        };
        return icons[category] || 'material-symbols:category-outline';
    }

    /**
     * Get default categories when API fails
     */
    private getDefaultCategories(): FieldLibraryCategory[] {
        return [
            {
                name: 'text-based',
                displayName: 'Text Based',
                description: 'Text input fields for various text-based data collection',
                icon: 'fluent:text-12-regular',
                fieldCount: 7,
                fields: []
            },
            {
                name: 'healthcare',
                displayName: 'Health Care',
                description: 'Specialized healthcare and medical fields',
                icon: 'healthicons:medical-kit',
                fieldCount: 8,
                fields: []
            }
        ];
    }

    /**
     * Cache management
     */
    private getCachedData(key: string): any {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    private setCachedData(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    private clearCache(): void {
        this.cache.clear();
    }
}

export const fieldLibraryService = FieldLibraryService.getInstance();
