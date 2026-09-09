import type { Lang } from '../i18n/ui';

/** One round of the misconfiguration spotter. */
export interface Round {
  id: string;
  title: string;
  lines: string[];
  /** Index into `lines` of the dangerous line. */
  answer: number;
  why: string;
  fix: string;
}

/**
 * Three real misconfigurations, not toy ones: a public bucket policy, an
 * iam:PassRole privilege-escalation path, and SSH open to the world.
 */
export const rounds: Record<Lang, Round[]> = {
  en: [
    {
      id: 's3',
      title: 'S3 bucket policy',
      lines: [
        '{',
        '  "Effect": "Allow",',
        '  "Principal": "*",',
        '  "Action": "s3:GetObject",',
        '  "Resource": "arn:aws:s3:::acme-invoices/*"',
        '}',
      ],
      answer: 2,
      why: 'A wildcard Principal grants every anonymous user on the internet read access to the bucket. This is the single most common cause of public data exposure on AWS.',
      fix: 'Name the account or role that actually needs it: "Principal": { "AWS": "arn:aws:iam::111122223333:role/invoice-reader" }',
    },
    {
      id: 'passrole',
      title: 'IAM policy',
      lines: [
        '{',
        '  "Effect": "Allow",',
        '  "Action": ["iam:PassRole", "ec2:RunInstances"],',
        '  "Resource": "*"',
        '}',
      ],
      answer: 3,
      why: 'iam:PassRole on * is a privilege-escalation path. The holder can launch an instance carrying any role in the account — including an administrator one — and inherit its permissions. The policy looks modest; the blast radius is total.',
      fix: 'Scope Resource to the exact roles that may be passed, and add a condition on iam:PassedToService.',
    },
    {
      id: 'sg',
      title: 'Security group',
      lines: [
        'GroupName: bastion-sg',
        'SecurityGroupIngress:',
        '  - IpProtocol: tcp',
        '    FromPort: 22',
        '    ToPort: 22',
        '    CidrIp: 0.0.0.0/0',
      ],
      answer: 5,
      why: 'SSH is reachable from the entire internet. Even with key-only auth this exposes the daemon to every scanner and every future CVE in it.',
      fix: 'Restrict the CIDR to your VPN range — or drop port 22 entirely and use SSM Session Manager, which needs no inbound rule at all.',
    },
  ],

  es: [
    {
      id: 's3',
      title: 'Política de bucket S3',
      lines: [
        '{',
        '  "Effect": "Allow",',
        '  "Principal": "*",',
        '  "Action": "s3:GetObject",',
        '  "Resource": "arn:aws:s3:::acme-invoices/*"',
        '}',
      ],
      answer: 2,
      why: 'Un Principal con comodín da acceso de lectura al bucket a cualquier usuario anónimo de internet. Es la causa más común de exposición pública de datos en AWS.',
      fix: 'Indica la cuenta o el rol que realmente lo necesita: "Principal": { "AWS": "arn:aws:iam::111122223333:role/invoice-reader" }',
    },
    {
      id: 'passrole',
      title: 'Política IAM',
      lines: [
        '{',
        '  "Effect": "Allow",',
        '  "Action": ["iam:PassRole", "ec2:RunInstances"],',
        '  "Resource": "*"',
        '}',
      ],
      answer: 3,
      why: 'iam:PassRole sobre * es una vía de escalada de privilegios. Quien la tenga puede lanzar una instancia con cualquier rol de la cuenta —incluido uno de administrador— y heredar sus permisos. La política parece modesta; el alcance es total.',
      fix: 'Limita Resource a los roles concretos que se pueden pasar y añade una condición sobre iam:PassedToService.',
    },
    {
      id: 'sg',
      title: 'Grupo de seguridad',
      lines: [
        'GroupName: bastion-sg',
        'SecurityGroupIngress:',
        '  - IpProtocol: tcp',
        '    FromPort: 22',
        '    ToPort: 22',
        '    CidrIp: 0.0.0.0/0',
      ],
      answer: 5,
      why: 'SSH queda accesible desde todo internet. Incluso con autenticación por clave, expone el demonio a cualquier escáner y a cualquier CVE futura.',
      fix: 'Limita el CIDR al rango de tu VPN, o elimina el puerto 22 y usa SSM Session Manager, que no necesita ninguna regla de entrada.',
    },
  ],
};
