import { NextResponse } from 'next/server';
import { localStore } from '@/lib/supabase/storage';
import crypto from 'crypto';

export async function GET() {
  const roles = localStore.getRoles();
  return NextResponse.json({ roles });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();

    if (json.action === 'toggle' && json.id !== undefined) {
      const updated = localStore.toggleRole(json.id, Boolean(json.active));
      return NextResponse.json({ ok: true, roles: updated });
    }

    if (json.name) {
      const newRole = {
        id: json.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: json.name,
        category: json.category || 'Custom Roles',
        description: json.description || `Mock interview role for ${json.name}`,
        skills: Array.isArray(json.skills) ? json.skills : ['Communication', 'Domain Knowledge'],
        active: true,
      };
      const updated = localStore.addRole(newRole);
      return NextResponse.json({ ok: true, role: newRole, roles: updated });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
