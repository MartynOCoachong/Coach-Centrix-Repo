import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { invitationId } = await req.json()

    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('association_invitations')
      .select(`
        id,
        email,
        token,
        associations (
          name
        )
      `)
      .eq('id', invitationId)
      .single()

    if (invitationError) throw invitationError

    // Send the email using your preferred email service
    // For this example, we'll just return the invitation details
    // You would typically integrate with SendGrid, AWS SES, or another email service here

    const inviteUrl = `${Deno.env.get('SITE_URL')}/invite?token=${invitation.token}`

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation sent successfully',
        invitation: {
          email: invitation.email,
          associationName: invitation.associations.name,
          inviteUrl
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})