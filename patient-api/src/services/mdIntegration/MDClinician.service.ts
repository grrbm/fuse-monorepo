import axios from 'axios';

interface License {
  license_id: string;
  type: string;
  value: string;
}


interface State {
  name: string;
  abbreviation: string;
  state_id: string;
  country: {
    country_id: string;
    name: string;
    abbreviation: string;
  };
  is_av_flow: boolean;
}

interface PracticeArea {
  clinician_practice_area_id: string;
  is_expired: boolean;
  expires_at: string;
  license_number: string;
  state: State;
}

interface ClinicianResponse {
  clinician_id: string;
  is_online: boolean;
  specialty: string;
  full_name: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  suffix: string;
  email: string;
  phone_number: string;
  phone_type: string;
  fax_number: string;
  profile_url: string;
  licenses: License[];
  practice_areas: PracticeArea[];
  bio_details: string;
  automatic_sync_message: string | null;
  is_message_availability: boolean;
  case_assignment_availability: boolean;
  active: boolean;
  is_out_of_office: boolean;
  out_of_office_message: string;
  managed_by_partner: boolean;
}

class MDClinicianService {
  private readonly apiUrl = 'https://api.mdintegrations.com/v1';

  async getClinician(clinicianId: string, accessToken: string): Promise<ClinicianResponse> {
    const response = await axios.get<ClinicianResponse>(
      `${this.apiUrl}/partner/clinicians/${clinicianId}`,
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

export default new MDClinicianService();