import { NextResponse } from 'next/server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

type InviteBody = {
  fullName?: string
  email?: string
  phone?: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'No autenticado.',
        },
        {
          status: 401,
        }
      )
    }

    /*
     * La secret key tiene privilegios elevados,
     * por eso primero comprobamos que quien
     * realiza la acción sea platform_admin.
     */
    const {
      data: isPlatformAdmin,
      error: roleError,
    } = await supabase.rpc(
      'is_platform_admin'
    )

    if (
      roleError ||
      !isPlatformAdmin
    ) {
      return NextResponse.json(
        {
          error: 'No autorizado.',
        },
        {
          status: 403,
        }
      )
    }

    const body =
      (await request.json()) as InviteBody

    const fullName =
      body.fullName?.trim() ?? ''

    const email =
      body.email
        ?.trim()
        .toLowerCase() ?? ''

    const phone =
      body.phone?.trim() ?? ''

    if (!fullName) {
      return NextResponse.json(
        {
          error:
            'El nombre completo es obligatorio.',
        },
        {
          status: 400,
        }
      )
    }

    if (!email) {
      return NextResponse.json(
        {
          error:
            'El correo es obligatorio.',
        },
        {
          status: 400,
        }
      )
    }

    const admin =
      createAdminClient()

    const {
      data,
      error: inviteError,
    } =
      await admin.auth.admin
        .inviteUserByEmail(
          email,
          {
            data: {
              full_name: fullName,
              phone:
                phone || null,
            },
          }
        )

    if (inviteError) {
      console.error(
        'Error invitando usuario:',
        inviteError
      )

      return NextResponse.json(
        {
          error:
            inviteError.message,
        },
        {
          status: 400,
        }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        {
          error:
            'Supabase no devolvió el usuario invitado.',
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json(
      {
        success: true,

        user: {
          id: data.user.id,
          email:
            data.user.email,
        },
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error(
      'Error interno invite-user:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Error interno del servidor.',
      },
      {
        status: 500,
      }
    )
  }
}