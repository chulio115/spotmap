import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '../config/email'

export async function sendInviteEmail(email) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [email],
        subject: 'Du wurdest zu SpotMap eingeladen! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #8B5CF6; margin: 0;">📍 SpotMap</h1>
              <p style="color: #666; margin: 5px 0;">Geheime Spots. Nur für deinen Circle.</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0 0 10px 0;">Du wurdest eingeladen! 🎉</h2>
              <p style="color: #666; margin: 0 0 20px 0;">
                Jemand hat dich zu SpotMap eingeladen. Erstelle jetzt deinen Account und entdecke geheime Spots!
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://spotmap-72e40.web.app/register?email=${encodeURIComponent(email)}" 
                   style="background: linear-gradient(135deg, #8B5CF6, #EC4899); 
                          color: white; padding: 15px 30px; text-decoration: none; 
                          border-radius: 8px; font-weight: bold; display: inline-block;">
                  Account erstellen
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; margin: 20px 0 0 0;">
                Oder kopiere diesen Link: <br>
                <span style="background: #eee; padding: 5px; border-radius: 4px; word-break: break-all;">
                  https://spotmap-72e40.web.app/register?email=${encodeURIComponent(email)}
                </span>
              </p>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>Du wurdest von einem Admin eingeladen. Falls du das nicht erwartest, ignoriere diese E-Mail.</p>
            </div>
          </div>
        `
      })
    })
    
    if (!response.ok) {
      throw new Error('Resend API error: ' + response.statusText)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error sending invite email:', error)
    throw error
  }
}
