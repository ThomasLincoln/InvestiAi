import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import type { Ativo } from "~/types";
import TableBody from "@mui/material/TableBody";


export default function Ativos({ items }: { items: Ativo[] }) {
    return (
        <div style={{ marginTop: '2pc' }}>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="caption table">
                    <caption>Teste</caption>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ativo</TableCell>
                            <TableCell align="right">Quantidade</TableCell>
                            <TableCell align="right">Preço Médio</TableCell>
                            <TableCell align="right">Preço Atual</TableCell>
                            <TableCell align="right">Variação</TableCell>
                            <TableCell align="right">Saldo</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.nome} - {item.ticker}</TableCell>
                                <TableCell align="right">{item.quantidade}</TableCell>
                                <TableCell align="right"></TableCell>
                                <TableCell align="right"></TableCell>
                                <TableCell align="right"></TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}