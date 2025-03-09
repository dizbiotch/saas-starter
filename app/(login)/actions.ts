'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  type NewActivityLog,
  ActivityType,
  invitations,
  candidates,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser,
} from '@/lib/auth/middleware';
import { use } from 'react';
import FormData from "form-data"; // form-data v4.0.1
import crypto from 'crypto';
import Mailgun from "mailgun-js"; // mailgun.js v11.1.0
const mailgunAPI = process.env.MAILGUN_API_KEY || 'default-api-key';

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string,
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || '',
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: users,
      team: teams,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password,
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash,
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password,
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  redirect('/dashboard/ActiveDashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string(),
  inviteId: z.string().optional(),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, companyName, inviteId } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password,
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    companyName,
    role: 'owner', // Default role, will be overridden if there's an invitation
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password,
    };
  }

  let teamId: number;
  let userRole: string;
  let createdTeam: typeof teams.$inferSelect | null = null;

  if (inviteId) {
    // Check if there's a valid invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending'),
        ),
      )
      .limit(1);

    if (invitation) {
      teamId = invitation.teamId;
      userRole = invitation.role;

      await db
        .update(invitations)
        .set({ status: 'accepted' })
        .where(eq(invitations.id, invitation.id));

      await logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION);

      [createdTeam] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);
    } else {
      return { error: 'Invalid or expired invitation.', email, password };
    }
  } else {
    // Create a new team if there's no invitation
    const newTeam: NewTeam = {
      name: `${email}'s Team`,
    };

    [createdTeam] = await db.insert(teams).values(newTeam).returning();

    if (!createdTeam) {
      return {
        error: 'Failed to create team. Please try again.',
        email,
        password,
      };
    }

    teamId = createdTeam.id;
    userRole = 'owner';

    await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
  }

  const newTeamMember: NewTeamMember = {
    userId: createdUser.id,
    teamId: teamId,
    role: userRole,
  };

  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: createdTeam, priceId });
  }

  redirect('/dashboard/ActiveDashboard');
});

export async function signOut() {
  const user = (await getUser()) as User;
  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return { error: 'Current password is incorrect.' };
    }

    if (currentPassword === newPassword) {
      return {
        error: 'New password must be different from the current password.',
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD),
    ]);

    return { success: 'Password updated successfully.' };
  },
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: 'Incorrect password. Account deletion failed.' };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.DELETE_ACCOUNT,
    );

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')`, // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId),
          ),
        );
    }

    (await cookies()).delete('session');
    redirect('/sign-in');
  },
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  companyName: z.string().min(1, 'Company name is required').max(100),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTeam = await getUserWithTeam(user.id);
    const { companyName } = data;
    await db.update(users).set({ name, email, companyName }).where(eq(users.id, user.id));
    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT),
    ]);

    return { success: 'Account updated successfully.' };
  },
);

const removeTeamMemberSchema = z.object({
  memberId: z.number(),
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId),
        ),
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER,
    );

    return { success: 'Team member removed successfully' };
  },
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner']),
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(
          eq(users.email, email),
          eq(teamMembers.teamId, userWithTeam.teamId),
        ),
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending'),
        ),
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    const [newInvitation] = await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending',
    }).returning();

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER,
    );

    // Send invitation email and include ?inviteId={id} to sign-up URL
    await sendInvitationEmail(email, role, newInvitation.id);

    return { success: 'Invitation sent successfully' };
  },
);

async function sendInvitationEmail(email: string, role: string, inviteId: number) {
  const inviteUrl = `https://yourapp.com/sign-up?inviteId=${inviteId}`;
  const subject = 'You are invited to join a team on SalesSaaA';
  const body = `
    Hi,

    You have been invited to join the team  as a ${role}.

    Please click the link below to accept the invitation:
    ${inviteUrl}

    If you did not expect this invitation, you can safely ignore this email.

    Best regards,
    SalesSaaA Team
  `;

  // Use your preferred email sending service here
  await sendEmail(email,"test","test", subject, body);
}

// export async function sendEmail(to: string, subject: string, body: string) {

//     if (!mailgunAPI) {
//       throw new Error('MAILGUN_API_KEY is not defined');
//     }
//     const mailgun = new Mailgun({ apiKey: mailgunAPI, domain: "sandbox319b260aa5124f3683db5c5435561bf1.mailgun.org" });
//     const mg = new Mailgun({
//       apiKey: process.env.API_KEY || "API_KEY",
//       domain: "sandbox319b260aa5124f3683db5c5435561bf1.mailgun.org"
//     });
//     try {
//       const data = await mg.messages().send({
//         from: "Mailgun Sandbox <postmaster@sandbox319b260aa5124f3683db5c5435561bf1.mailgun.org>",
//         to: to,
//         subject: subject,
//         text: body,
//       });
  
//       console.log(data); // logs response data
//     } catch (error) {
//       console.log(error); //logs any error
//     }
//   }

export async function sendPasswordResetEmail(to: string, owner:string, passwordUrl: string) {
  const mailgun = new Mailgun({ apiKey: mailgunAPI, domain: "mail.getnerva.ai" });
  
  const mg = new Mailgun({ apiKey: mailgunAPI, domain: "mail.getnerva.ai" });

  try {
    const data = await mg.messages().send({
      from: "GetNerva Ai <no-reply@mail.getnerva.ai>",
      to: [to],
      subject: "Password Reset for Nerva",
      template: "passwordResetNerva",
      "h:X-Mailgun-Variables": JSON.stringify({
        OwnerName: owner,
        passwordURL: passwordUrl,
      }),
    });
    console.log(data); // logs response data
  } catch (error) {
    console.log(error); // logs any error
  }
}


export async function sendEmail(to: string, name:string, companyName: string, subject: string, body: string) {
  const mailgun = new Mailgun({ apiKey: mailgunAPI, domain: "mail.getnerva.ai" });
  
    const urlString = "https://getnerva.ai/interviewpage?user="+body;
    const url = new URL(urlString);

    sendSimpleMessageTemplate(to, name, companyName, urlString, urlString);
 
}


export async function sendSimpleMessageTemplate(to: string, name:string, companyName: string, subject: string, urlString: string) {
  const mailgun = new Mailgun({ apiKey: mailgunAPI, domain: "mail.getnerva.ai" });

  const mg = new Mailgun({ apiKey: mailgunAPI, domain: "mail.getnerva.ai" });

  try {
    const data = await mg.messages().send({
      from: "GetNerva Ai <no-reply@mail.getnerva.ai>",
      to: [to],
      subject: "Practice interview for "+companyName,
      template: "GetNerva Candidate",
      "h:X-Mailgun-Variables": JSON.stringify({
        CandidateName: name,
        CompanyName: companyName,
        NervaURL: urlString,
      }),
    });
    console.log(data); // logs response data
  } catch (error) {
    console.log(error); // logs any error
  }
}



export async function updateColdCallPrompt(coldCallPrompt: string, user: User) {
  const userWithTeam = await getUserWithTeam(user.id);

  await Promise.all([
    db.update(users).set({ ColdCallPrompt: coldCallPrompt }).where(eq(users.id, user.id)),
    logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_COLD_CALL_PROMPT),
  ]);

  return { success: 'Interview question updated successfully.' };
}

export async function getCandidates(userId: number)  {

  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }


  const result = await db
    .select()
    .from(candidates)
    .where(eq(candidates.userCreator, user.id.toString()));

  return result;
}

export async function createCandidate(userId: number, candidate: {
  name: string;
  email: string;
  phone: string;
  status: string;
  rating: string;
  conversationID?: string;
}) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  if (!user.CandidateTable) {
    user.CandidateTable = `candidates_${userId}`;
  }

  const result = await db
    .insert(candidates)
    .values({
      ...candidate,
      updatedAt: new Date(),
      candidateTable: user.CandidateTable,
      conversationID: candidate.conversationID || '',
      userCreator: user.id.toString(),
      ChatGPTFeedBack: '', // Add default or appropriate value for ChatGPTFeedBack
    })
    .returning({ id: candidates.id });

  return result[0];
}

export async function getOneCandidate(CandidateEmail: string) {


  const result = await db
    .select()
    .from(candidates)
    .where(eq(candidates.email, CandidateEmail))
    .limit(1);
  // console.log(CandidateEmail+" result");
  // if (result.length === 0) {
  //   throw new Error('Candidate not found');
  // }

  return result[0];
}

export async function getOneCandidateOfID(CandidateID: number) {


  const result = await db
    .select()
    .from(candidates)
    .where(eq(candidates.id, CandidateID))
    .limit(1);
  // console.log(CandidateEmail+" result");
  // if (result.length === 0) {
  //   throw new Error('Candidate not found');
  // }

  return result[0];
}

export async function getOneUser(userId: string) {


  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, parseInt(userId)))
    .limit(1);

  if (result.length === 0) {
    throw new Error('User not found');
  }

  return result[0];
}

export async function getUserOffInterview(interveeEmail: string) {

const candidate = await getOneCandidate(interveeEmail);
const user = await getOneUser(candidate.userCreator);

return user
}

export async function updateCandidatesConversationID(candidateEmail: string, conversationID: string) {
  const candidate = await getOneCandidate(candidateEmail);

  await db
    .update(candidates)
    .set({ conversationID })
    .where(eq(candidates.email, candidateEmail));

  return { success: 'Candidate conversation ID updated successfully.' };
}
export async function getCandidatesConversationID(candidateEmail: string) {
  const candidate = await getOneCandidate(candidateEmail);
  return candidate.conversationID;
}

export async function updateChatGPTFeedback(candidateEmail: string, feedback: string) {
  const candidate = await getOneCandidate(candidateEmail);
  // console.log(feedback);
  let grade = feedback.split('\n')[0]; // Get the first line of feedback for grade
  
   grade = grade.split(' ')[1]; 
   console.log(grade);
  await db
    .update(candidates)
    .set({ ChatGPTFeedBack: feedback, updatedAt: new Date(), status: "Completed", rating: grade })
    .where(eq(candidates.email, candidateEmail));

  return { success: 'Candidate ChatGPT feedback updated successfully.' };
}

export async function getChatGPTFeedback(candidateEmail: string) {
  const candidate = await getOneCandidate(candidateEmail);
  return candidate.ChatGPTFeedBack;
}


export async function deleteCandidatebyID(candidateID: number) {
  const candidate = await getOneCandidateOfID(candidateID);

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  await db
    .delete(candidates)
    .where(eq(candidates.id, candidateID));

  return { success: 'Candidate deleted successfully.' };
}


export async function fetchCandidates(user: User) {
  if (user) {
    const data = await getCandidates(user.id);
    const formattedData = data.map(candidate => ({
      ...candidate,
      userId: candidate.id.toString(),
      lastModified: new Date(candidate.updatedAt),
      name: candidate.name ?? '', // Handle null name
    })).map(candidate => ({
      ...candidate,
      lastModified: candidate.lastModified.getTime() ? new Date() : candidate.lastModified
    }));
    return formattedData;
  }
  return [];
}

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function resetPassword(email: string) {

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) {
    return { error: 'No user found with this email address.' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  await db
    .update(users)
    .set({ resetToken })
    .where(eq(users.email, email));
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const username = userRecord[0]?.name;

  const resetUrl = `https://getnerva.ai/reset-password?token=${resetToken}`;

  await sendPasswordResetEmail(email, userRecord[0]?.name ?? 'User', resetUrl);

  return { success: 'Password reset email sent successfully.' };
}

const newPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const setNewPassword = validatedAction(newPasswordSchema, async (data) => {
  const { token, newPassword } = data;

  const user = await db
    .select()
    .from(users)
    .where(eq(users.resetToken, token))
    .limit(1);

 

  const newPasswordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({ passwordHash: newPasswordHash, resetToken: null })
    .where(eq(users.id, user[0].id));

  return { success: 'Password reset successfully.' };
});


  export async function resetPasswordwithToken(token: string, password: string) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, token))
      .limit(1);

    if (user.length === 0) {
      return { error: 'Invalid or expired token.' };
    }

    const newPasswordHash = await hashPassword(password);

    await db
      .update(users)
      .set({ passwordHash: newPasswordHash, resetToken: null })
      .where(eq(users.id, user[0].id));

    return { success: 'Password reset successfully.' };
  }
