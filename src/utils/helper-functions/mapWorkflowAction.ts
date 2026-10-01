export const mapWorkflowAction = (workflowAction: string) => {
    switch (workflowAction) {
        case "V": return "VERIFY";
        case "VA": return "APPROVE";
        case "I": return "ISSUE";
        case "B": return "SEND_BACK";
        case "F": return "FORWARD";
        case "R": return "REJECT";
        case "T": return "TRANSACTION_SUCCESS";
        case "U": return "FORM1_BACK";
        case "BI": return "INSPECTOR_BACK";
    }
};