import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  redirectUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectUrl }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Generate password reset link
    const { data, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (resetError) {
      console.error("Error generating reset link:", resetError);
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ message: "If an account exists with this email, you will receive a password reset link." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resetLink = data?.properties?.action_link;

    if (!resetLink) {
      return new Response(
        JSON.stringify({ message: "If an account exists with this email, you will receive a password reset link." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: "GoalSync <onboarding@resend.dev>",
      to: [email],
      subject: "Reset Your Password - GoalSync",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; margin-bottom: 16px;"></div>
              <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0;">GoalSync</h1>
            </div>
            
            <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 16px;">Reset Your Password</h2>
            
            <p style="font-size: 16px; color: #6b7280; line-height: 1.6; margin-bottom: 24px;">
              We received a request to reset your password. Click the button below to create a new password. This link will expire in 1 hour.
            </p>
            
            <a href="${resetLink}" style="display: block; width: 100%; padding: 14px 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; text-align: center; font-weight: 600; font-size: 16px; border-radius: 12px; box-sizing: border-box;">
              Reset Password
            </a>
            
            <p style="font-size: 14px; color: #9ca3af; line-height: 1.6; margin-top: 24px;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              This email was sent by GoalSync. If you have questions, please contact support.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Password reset email sent:", emailResponse);

    return new Response(
      JSON.stringify({ message: "If an account exists with this email, you will receive a password reset link." }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in password reset function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
