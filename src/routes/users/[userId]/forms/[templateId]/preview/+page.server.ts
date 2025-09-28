import { error, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getFormTemplateDetails } from "../../../../../api/services/form-template";

////////////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {

    event.depends('app:allNodes')
    try {
        const assessmentTemplateId = event.params.templateId;
        const response = await getFormTemplateDetails(assessmentTemplateId);

        if (response.Status === 'failure' || response.HttpCode !== 200) {
            throw error(response.HttpCode, response.Message);
        }

        const assessmentTemplate = response.Data;
        console.log("Response data",response)
        return {
            assessmentTemplateId,
            assessmentTemplate,
            message: response.Message
        };
    } catch (error) {
        console.error(`Error retriving assessment templates: ${error}`);
    }
};