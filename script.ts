import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    await prisma.usuario.deleteMany()
    const usuario = await prisma.usuario.createMany({
        data: [
        {
            nombre: "Joe Hendry",
            email: "joehendry@gmail.com",
            edad: 25
        },
        {
            nombre: "DUMMYEAH",
            email: "DUMMYEAH@gmail.com",
            edad: 25
        }
    ]})
    console.log(usuario)
}

main()
    .catch(
        e => {console.error(e.message)}
    )
    .finally(
        async() => {
            await prisma.$disconnect()
        }
    )