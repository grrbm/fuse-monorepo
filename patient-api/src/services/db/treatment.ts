import Treatment from "../../models/Treatment";

export const getTreatment = async (treatmentId: string): Promise<Treatment | null> => {
    return Treatment.findByPk(treatmentId);
}