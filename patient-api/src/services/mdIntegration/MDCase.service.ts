import axios from 'axios';

interface License {
  license_id: string;
  type: string;
  value: string;
}

interface Clinician {
  first_name: string;
  last_name: string;
  suffix: string;
  profile_url: string;
  is_online: boolean;
  clinician_id: string;
  full_name: string;
  specialty: string;
  licenses: License[];
}

interface CaseAssignment {
  created_at: string;
  case_assignment_id: string;
  clinician: Clinician;
}

interface Patient {
  prefix: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: number;
  phone_number: string;
  phone_type: string;
  active: boolean;
  metadata: string;
}

interface CaseResponse {
  case_id:string;
  metadata:string; 
  patient: Patient;
  case_assignment: CaseAssignment;
}

interface Offering {
  offering_id: string;
}

interface Disease {
  disease_id: string
}

interface Question {
  question: string;
  answer: string;
  type: string;
}

interface CreateCaseRequest {
  hold_status?: boolean;
  is_additional_approval_needed?: boolean;
  reference_case_id?: string;
  patient_id: string;
  metadata?: string;
  clinician_id?: string;
  case_offerings?: Offering[];
  diseases?: Disease[];
  case_files?: string[];
  case_questions?: Question[];
  is_chargeable?: boolean;
  tags?: Array<{ uuid: string }>;
}

class MDCaseService {
  private readonly apiUrl = 'https://api.mdintegrations.com/v1';

  async getCase(caseId: string, accessToken: string): Promise<CaseResponse> {
    const response = await axios.get<CaseResponse>(
      `${this.apiUrl}/partner/cases/${caseId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  async createCase(caseData: CreateCaseRequest, accessToken: string): Promise<CaseResponse> {
    const response = await axios.post<CaseResponse>(
      `${this.apiUrl}/partner/cases`,
      caseData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }
}

export default new MDCaseService();