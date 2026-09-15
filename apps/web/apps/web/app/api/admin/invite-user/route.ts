import { NextResponse } from 'next/server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

type BuildingRole =
  | 'admin'
  | 'owner'
  | 'resident'

type UnitRole =
  | 'owner'
  | 'resident'

type InviteBody = {
  fullName?: string
  email?: string
  phone?: string | null

  buildingId?: string
  buildingRole?: BuildingRole

  unitId?: string | null
  unitRole?: UnitRole | null
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

    const buildingId =
      body.buildingId?.trim() ?? ''

    const buildingRole =
      body.buildingRole

    const unitId =
      body.unitId?.trim() || null

    const unitRole =
      body.unitRole ?? null

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

    if (!buildingId) {
      return NextResponse.json(
        {
          error:
            'Debes seleccionar un edificio.',
        },
        {
          status: 400,
        }
      )
    }

    if (
      !buildingRole ||
      ![
        'admin',
        'owner',
        'resident',
      ].includes(buildingRole)
    ) {
      return NextResponse.json(
        {
          error:
            'El rol del edificio no es válido.',
        },
        {
          status: 400,
        }
      )
    }

    if (
      unitId &&
      (
        !unitRole ||
        ![
          'owner',
          'resident',
        ].includes(unitRole)
      )
    ) {
      return NextResponse.json(
        {
          error:
            'El rol de la unidad no es válido.',
        },
        {
          status: 400,
        }
      )
    }

    const admin =
      createAdminClient()

    /*
     * Verificamos que el edificio exista
     * y esté activo.
     */
    const {
      data: building,
      error: buildingError,
    } = await admin
      .from('buildings')
      .select('id, name, active')
      .eq('id', buildingId)
      .single()

    if (
      buildingError ||
      !building
    ) {
      return NextResponse.json(
        {
          error:
            'El edificio seleccionado no existe.',
        },
        {
          status: 400,
        }
      )
    }

    if (!building.active) {
      return NextResponse.json(
        {
          error:
            'El edificio seleccionado está inactivo.',
        },
        {
          status: 400,
        }
      )
    }

    /*
     * Si viene unidad, validamos que
     * pertenezca al edificio seleccionado.
     */
    if (unitId) {
      const {
        data: unit,
        error: unitError,
      } = await admin
        .from('units')
        .select(
          'id, building_id, active'
        )
        .eq('id', unitId)
        .eq(
          'building_id',
          buildingId
        )
        .single()

      if (
        unitError ||
        !unit
      ) {
        return NextResponse.json(
          {
            error:
              'La unidad seleccionada no pertenece al edificio.',
          },
          {
            status: 400,
          }
        )
      }

      if (!unit.active) {
        return NextResponse.json(
          {
            error:
              'La unidad seleccionada está inactiva.',
          },
          {
            status: 400,
          }
        )
      }
    }

    /*
     * Creamos e invitamos al usuario.
     */
    const {
      data: inviteData,
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

    const invitedUser =
      inviteData.user

    if (!invitedUser) {
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

    /*
     * Garantizamos que profile exista.
     * Tu trigger debería hacerlo,
     * pero este upsert vuelve el flujo
     * más robusto.
     */
    const {
      error: profileError,
    } = await admin
      .from('profiles')
      .upsert(
        {
          id: invitedUser.id,
          full_name: fullName,
          email,
          phone:
            phone || null,
        },
        {
          onConflict: 'id',
        }
      )

    if (profileError) {
      console.error(
        'Error creando profile:',
        profileError
      )

      return NextResponse.json(
        {
          error:
            'La cuenta fue creada, pero no fue posible crear el perfil.',
        },
        {
          status: 500,
        }
      )
    }

    /*
     * Asignación al edificio.
     */
    const {
      error:
        buildingMemberError,
    } = await admin
      .from('building_members')
      .insert({
        building_id: buildingId,
        user_id: invitedUser.id,
        role: buildingRole,
      })

    if (buildingMemberError) {
      console.error(
        'Error creando building member:',
        buildingMemberError
      )

      return NextResponse.json(
        {
          error:
            'La cuenta fue creada, pero no fue posible asignarla al edificio.',
        },
        {
          status: 500,
        }
      )
    }

    /*
     * Asignación opcional a unidad.
     */
    if (unitId && unitRole) {
      const {
        error:
          unitMemberError,
      } = await admin
        .from('unit_members')
        .insert({
          unit_id: unitId,
          user_id: invitedUser.id,
          role: unitRole,
          start_date:
            new Date()
              .toISOString()
              .slice(0, 10),
        })

      if (unitMemberError) {
        console.error(
          'Error creando unit member:',
          unitMemberError
        )

        return NextResponse.json(
          {
            error:
              'La cuenta y el edificio fueron creados, pero no fue posible asignar la unidad.',
          },
          {
            status: 500,
          }
        )
      }
    }

    return NextResponse.json(
      {
        success: true,

        user: {
          id: invitedUser.id,
          email:
            invitedUser.email,
        },

        assignment: {
          buildingId,
          buildingRole,
          unitId,
          unitRole,
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