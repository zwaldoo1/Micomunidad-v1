import { NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

type InviteBody = {
  fullName?: string
  email?: string
  phone?: string
}

export async function POST(request: Request) {
  try {
    /*
     * 1. Verificamos al usuario actualmente autenticado.
     *
     * Nunca debemos confiar únicamente en que esta ruta
     * está "oculta" dentro de /admin.
     */
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (
      userError ||
      !user
    ) {
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
     * 2. Confirmamos que sea platform admin.
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

    /*
     * 3. Leemos y validamos los datos.
     */
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
            'El nombre es obligatorio.',
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

    /*
     * 4. Cliente privilegiado.
     */
    const admin =
      createAdminClient()

    /*
     * 5. Enviamos invitación.
     *
     * full_name y phone quedan almacenados
     * en user_metadata.
     *
     * Tu trigger sync_auth_user_profile()
     * luego los copiará a profiles.
     */
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
      'Invite API error:',
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