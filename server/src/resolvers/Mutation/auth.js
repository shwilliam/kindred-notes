const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {getUserId} = require('../../utils')

const auth = {
  async signup(parent, args, context) {
    const password = await bcrypt.hash(args.password, 10)
    // TODO: DRY up tag/interests duplicate check logic
    const interests = await context.prisma.interests()
    const {existingInterests, newInterests} = args.interests.reduce(
      (interestSummary, interest) => {
        const existingEntry =
          interests && interests.find(({title}) => title === interest)
        if (existingEntry) {
          return {
            ...interestSummary,
            existingInterests: [
              ...interestSummary.existingInterests,
              existingEntry.id,
            ],
          }
        } else {
          return {
            ...interestSummary,
            newInterests: [...interestSummary.newInterests, interest],
          }
        }
      },
      {existingInterests: [], newInterests: []},
    )

    const user = await context.prisma.createUser({
      ...args,
      password,
      interests: {
        create: newInterests.map(title => ({title})),
        connect: existingInterests.map(id => ({id})),
      },
    })

    return {
      token: jwt.sign({userId: user.id}, process.env.APP_SECRET),
      user,
    }
  },

  async login(parent, {username, password}, context) {
    const user = await context.prisma.user({username})
    if (!user) {
      throw new Error(`No user found for username: ${username}`)
    }
    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      throw new Error('Invalid password')
    }
    return {
      token: jwt.sign({userId: user.id}, process.env.APP_SECRET),
      user,
    }
  },

  async updateUser(parent, {avatar, interests}, context) {
    const userId = getUserId(context)
    const currentInterests = await context.prisma.user({id: userId}).interests()
    const allInterests = await context.prisma.interests()

    const {existingInterests, newInterests} = interests.reduce(
      (interestSummary, interest) => {
        const existingEntry =
          allInterests && allInterests.find(({title}) => title === interest)
        if (existingEntry) {
          return {
            ...interestSummary,
            existingInterests: [
              ...interestSummary.existingInterests,
              existingEntry.id,
            ],
          }
        } else {
          return {
            ...interestSummary,
            newInterests: [...interestSummary.newInterests, interest],
          }
        }
      },
      {existingInterests: [], newInterests: []},
    )

    const removedInterests = currentInterests
      .filter(
        interest => interest.id && !existingInterests.includes(interest.id),
      )
      .map(({id}) => id)

    return context.prisma.updateUser({
      where: {id: userId},
      data: {
        avatar,
        interests: {
          create: newInterests.map(title => ({title})),
          connect: existingInterests.map(id => ({id})),
          disconnect: removedInterests.map(id => ({id})),
        },
      },
    })
  },

  async updateInterests(parent, {interests}, context) {
    const userId = getUserId(context)

    return context.prisma.updateUser({
      where: {id: userId},
      data: {
        interests: {
          upsert: interests.map(i => ({title: i})),
        },
      },
    })
  },
}

module.exports = {auth}
