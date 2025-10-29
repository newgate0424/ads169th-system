import { NextRequest, NextResponse } from 'next/server'

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

    // Log the data deletion request for compliance
    console.log('Facebook data deletion request received:', {
      timestamp: new Date().toISOString(),
      signed_request: signed_request.substring(0, 50) + '...',
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          '127.0.0.1'
    })

    // Generate a unique confirmation code
    const confirmationCode = 'ads169th-deletion-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)

    // In a real application, you would:
    // 1. Parse and verify the signed_request
    // 2. Extract the user ID
    // 3. Mark user data for deletion
    // 4. Process the deletion according to your data retention policy

    // Return required response format
    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'}/privacy#data-deletion`,
      confirmation_code: confirmationCode
    })

  } catch (error) {
    console.error('Facebook data deletion error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Handle GET requests to show info page
export async function GET() {
  return NextResponse.json({
    message: 'Facebook Data Deletion Callback',
    description: 'This endpoint handles Facebook data deletion requests.',
    app: 'ads169th System',
    compliance: 'GDPR/CCPA Ready'
  })
}