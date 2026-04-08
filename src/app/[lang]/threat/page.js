import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ThreatDashboardClient from "./ThreatDashboardClient";

export default async function ThreatDashboardPage(props) {
  const params = await props.params;
  const cookieStore = await cookies();
  const token = cookieStore.get('threat_token');
  
  if (token?.value !== 'granted-neo-level-access') {
    redirect(`/${params?.lang || 'en'}/threat/login`);
  }

  return <ThreatDashboardClient />;
}
