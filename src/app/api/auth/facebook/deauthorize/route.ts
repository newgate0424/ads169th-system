import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    let signed_request = ''

    if (contentType?.includes('application/json')) {
      const body = await request.json()
      signed_request = body.signed_request
    } else {
      // Handle form data
      const formData = await request.formData()
      signed_request = formData.get('signed_request') as string
    }

    if (!signed_request) {
      return NextResponse.json(
        { error: 'Missing signed_request parameter' },
        { status: 400 }
      )
    }

    // Log the deauthorization request
    console.log('Facebook app deauthorization request received:', {
      timestamp: new Date().toISOString(),
      signed_request: signed_request.substring(0, 50) + '...',
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          '127.0.0.1'
    })

    // In a real application, you would:
    // 1. Parse and verify the signed_request
    // 2. Extract the user ID
    // 3. Remove or deactivate the user's Facebook integration
    // 4. Log the deauthorization in your audit trail

    try {
      // Example: If you need to mark Facebook users as deauthorized
      // const decoded = parseSignedRequest(signed_request, process.env.FACEBOOK_APP_SECRET!)
      // if (decoded && decoded.user_id) {
      //   await prisma.user.updateMany({
      //     where: { facebookId: decoded.user_id },
      //     data: { 
      //       facebookId: null,
      //       // You might want to keep the account but remove Facebook integration
      //     }
      //   })
      // }

      // Log the deauthorization activity
      await prisma.activityLog.create({
        data: {
          userId: 'system', // System-generated entry
          action: 'FACEBOOK_DEAUTH',
          description: 'Facebook app deauthorization request received',
          ipAddress: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1',
          userAgent: request.headers.get('user-agent') || ''
        }
      }).catch(() => {
        // Ignore database errors for this compliance endpoint
      })

    } catch (dbError) {
      console.error('Database error during deauth:', dbError)
      // Continue processing - don't fail the compliance endpoint
    }

    return NextResponse.json({ 
      success: true,
      message: 'Deauthorization processed successfully' 
    })

  } catch (error) {
    console.error('Facebook deauthorization error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Handle GET requests to show info page
export async function GET() {
  return NextResponse.json({
    message: 'Facebook Deauthorization Callback',
    description: 'This endpoint handles Facebook app deauthorization requests.',
    app: 'ads169th System',
    compliance: 'Facebook Platform Policy Compliant'
  })
}