// +layout.server.ts
import { error, type ServerLoadEvent } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getFormTemplateById, getFormTemplateDetails } from '../../../api/services/form-template';


//////////////////////////////////////////////////////////////////////

export const load: LayoutServerLoad = async (event: ServerLoadEvent) => {
    const { userId } = event.params;

    try {
        const ownerUserId = userId;
        const response = await getFormTemplateById({
            ownerUserId: ownerUserId,
            orderBy: "Title",
            order: "ascending"
        });
        if (response.Status === 'failure' || response.HttpCode !== 200) {
            throw error(response.HttpCode, response.Message);
        }

        const templateDetails = [];

        const assessmentTemplate = response.Data ?? [];
        // console.log("assessmentTemplate", assessmentTemplate);
        for (const item of assessmentTemplate.Items) {
            const templateId = item.id;
            const details = await getFormTemplateDetails(templateId);

            templateDetails.push({
                id: templateId,
                Title: item.Title,
                Description: item.Description,
                Type: item.Type,
                DisplayCode: item.DisplayCode,
                Version: item.CurrentVersion,
                CDATASectionreatedAt: item.CreatedAt,
                UpdatedAt: item.UpdatedAt,
                Data: item.Data,
                IsFavourite: item.IsFavourite || false, // Add IsFavourite property, default to false
                ...details
            });
        }

        return {
            templates: templateDetails
        };

    } catch (error) {
        console.error('Error loading layout data:', error);
        return {
            templates: []
        };
    }
};