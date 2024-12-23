import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto{

    @ApiProperty({
        default: 10,
        description: "How many rows do you need?",
    })
    @IsOptional()
    @IsPositive()
    //Con el decorador type podemos realizar cambios de los tipos de datos
    @Type( () => Number)//Es opcional pero podemos hacer la conversion de todos los dtos en el main con el enableImplicitConversions: true en el ValidationPipe
    limit?: number;

    @ApiProperty({
        default: 0,
        description: "How many rows do you need to skip?",
    })
    @IsOptional()
    @Min(0)
    @Type( () => Number)
    offset?: number;
}