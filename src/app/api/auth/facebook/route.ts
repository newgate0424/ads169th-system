import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { accessToken, userID } = await request.json()

    if (!accessToken || !userID) {
      return NextResponse.json(
        { error: 'ข้อมูล Facebook ไม่ครบถ้วน' },
        { status: 400 }
      )
    }

    // Verify Facebook access token and get user info
    const fbResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    )

    if (!fbResponse.ok) {
      return NextResponse.json(
        { error: 'Facebook token ไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const fbUser = await fbResponse.json()

    if (fbUser.id !== userID) {
      return NextResponse.json(
        { error: 'Facebook user ID ไม่ตรงกัน' },
        { status: 400 }
      )
    }

    // Check if user exists in database
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: fbUser.email || undefined },
          { facebookId: fbUser.id }
        ]
      }
    })

    // If user doesn't exist, create new user
    if (!user) {
      // Check if Facebook registration is allowed
      // You might want to restrict this based on your business logic
      
      user = await prisma.user.create({
        data: {
          username: fbUser.email || `fb_${fbUser.id}`,
          email: fbUser.email || `${fbUser.id}@facebook.user`,
          name: fbUser.name,
          facebookId: fbUser.id,
          profilePicture: fbUser.picture?.data?.url,
          role: 'EMPLOYEE', // Default role for Facebook users
          isActive: true,
          // Note: No password needed for Facebook users
          password: '' // Empty password - they login via Facebook
        }
      })
    } else {
      // Update user's Facebook information if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          facebookId: fbUser.id,
          profilePicture: fbUser.picture?.data?.url,
          name: fbUser.name // Update name if changed
        }
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ' },
        { status: 403 }
      )
    }

    // Create session
    const sessionToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1',
        expiresAt
      }
    })

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set('session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'FACEBOOK_LOGIN',
        description: `เข้าสู่ระบบด้วย Facebook: ${fbUser.name}`,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1',
        userAgent: request.headers.get('user-agent') || ''
      }
    })

    return NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    })

  } catch (error) {
    console.error('Facebook auth error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}